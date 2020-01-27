import crypto from 'crypto'
import {
	Channel,
	// MerkleTree,
	splitSig,
	ChannelState,
	RoutineOps,
} from 'adex-protocol-eth/js'
import BalanceTree from 'adex-protocol-eth/js/BalanceTree'
import { getEthers } from 'services/smart-contracts/ethers'
import {
	getIdentityTxnsWithNoncesAndFees,
	getIdentityTxnsTotalFees,
	processExecuteByFeeTokens,
	getApproveTxns,
} from 'services/smart-contracts/actions/identity'
import { getWithdrawTokensBalances } from 'services/smart-contracts/actions/stats'
import { contracts } from '../contractsCfg'
import { closeCampaign } from 'services/adex-validator/actions'
import { Campaign, AdUnit } from 'adex-models'
import { getAllCampaigns } from 'services/adex-market/actions'
import {
	bigNumberify,
	randomBytes,
	parseUnits,
	Interface,
	// formatUnits,
	getAddress,
} from 'ethers/utils'
import {
	selectFeeTokenWhitelist,
	selectRoutineWithdrawTokens,
	selectMainFeeToken,
	selectSaiToken,
} from 'selectors'
import IdentityABI from 'adex-protocol-eth/abi/Identity'

const { AdExCore } = contracts
const Core = new Interface(AdExCore.abi)
const Identity = new Interface(IdentityABI)

const timeframe = 15 * 1000 // 1 event per 15 seconds
const VALID_UNTIL_COEFFICIENT = 0.5
const VALID_UNTIL_MIN_PERIOD = 15 * 24 * 60 * 60 * 1000 // 15 days in ms

function toEthereumChannel(channel) {
	const specHash = crypto
		.createHash('sha256')
		.update(JSON.stringify(channel.spec))
		.digest()

	return new Channel({
		title: channel.title,
		creator: channel.creator,
		tokenAddr: channel.depositAsset,
		tokenAmount: channel.depositAmount,
		validUntil: channel.validUntil,
		validators: channel.spec.validators.map(v => v.id),
		spec: specHash,
	})
}

function getValidUntil(activeFrom, withdrawPeriodStart) {
	const period = withdrawPeriodStart - activeFrom
	const validUntil =
		withdrawPeriodStart +
		Math.max(period * VALID_UNTIL_COEFFICIENT, VALID_UNTIL_MIN_PERIOD)

	return Math.floor(validUntil / 1000)
}

function getReadyCampaign(campaign, identity, mainToken) {
	const newCampaign = new Campaign(campaign)
	newCampaign.creator = identity.address
	newCampaign.created = Date.now()
	newCampaign.validUntil = getValidUntil(
		newCampaign.activeFrom,
		newCampaign.withdrawPeriodStart
	)
	newCampaign.nonce = bigNumberify(randomBytes(32)).toString()
	newCampaign.adUnits = newCampaign.adUnits.map(unit => new AdUnit(unit).spec)
	newCampaign.depositAmount = parseUnits(
		newCampaign.depositAmount || '0',
		mainToken.decimals
	).toString()

	// NOTE: TEMP in UI its set per 1000 impressions (CPM)
	newCampaign.minPerImpression = parseUnits(
		newCampaign.minPerImpression || '0',
		mainToken.decimals
	)
		.div(bigNumberify(1000))
		.toString()
	newCampaign.maxPerImpression = newCampaign.minPerImpression

	newCampaign.depositAsset = mainToken.address
	newCampaign.eventSubmission = {
		allow: [
			{
				uids: [
					newCampaign.creator,
					newCampaign.validators[0].id,
					newCampaign.validators[1].id,
				],
			},
			{ uids: null, rateLimit: { type: 'ip', timeframe } },
		],
	}

	newCampaign.status = {
		name: 'Pending',
		humanFriendlyName: 'Active',
		lastChecked: Date.now(),
	}

	return newCampaign
}

const getExpiredWithdrawnOutstanding = async ({ channel, AdExCore }) => {
	const [withdrawn, state] = await Promise.all([
		AdExCore.functions.withdrawn(channel.id),
		AdExCore.functions.states(channel.id),
	])

	if (state === ChannelState.Active) {
		return bigNumberify(channel.depositAmount).sub(withdrawn)
	} else {
		return bigNumberify('0')
	}
}

const getWithdrawnPerUserOutstanding = async ({
	AdExCore,
	channel,
	balance,
	identityAddr,
}) => {
	return bigNumberify(balance).sub(
		await AdExCore.functions.withdrawnPerUser(channel.id, identityAddr)
	)
}

export async function getChannelsWithOutstanding({ identityAddr, wallet }) {
	const { authType } = wallet
	const channels = await getAllCampaigns(true)
	const { AdExCore } = await getEthers(authType)
	const feeTokenWhitelist = selectFeeTokenWhitelist()
	const routineWithdrawTokens = selectRoutineWithdrawTokens()

	const all = await Promise.all(
		channels
			.filter(
				channel =>
					channel &&
					channel.status &&
					channel.status.lastApprovedBalances &&
					channel.status.lastApprovedSigs &&
					routineWithdrawTokens[channel.depositAsset]
			)
			.map(channel => {
				const { lastApprovedBalances } = channel.status

				const validBalances = Object.entries(lastApprovedBalances).reduce(
					(balances, e) => {
						const [address, balance] = e
						try {
							if (getAddress(address)) {
								balances[address] = balance
							}
						} catch {}
						return balances
					},
					{}
				)

				channel.status.lastApprovedBalances = validBalances

				return channel
			})
			.map(channel => {
				const { lastApprovedSigs, lastApprovedBalances } = channel.status

				const bTree = new BalanceTree(lastApprovedBalances)
				return {
					lastApprovedSigs,
					// mTree,
					bTree,
					channel,
				}
			})
			.filter(({ channel, bTree }) => {
				if (!!channel.status && channel.status.name === 'Expired') {
					return channel.creator.toLowerCase() === identityAddr.toLowerCase()
				}

				return bTree && !bTree.getBalance(identityAddr).isZero()
			})
			.map(async ({ channel, lastApprovedSigs, bTree }) => {
				//  mTree,
				const balance = bTree.getBalance(identityAddr).toString()

				const outstanding =
					channel.status.name === 'Expired'
						? await getExpiredWithdrawnOutstanding({ channel, AdExCore })
						: await getWithdrawnPerUserOutstanding({
								AdExCore,
								channel,
								balance,
								identityAddr,
						  })

				const outstandingAvailable = outstanding.sub(
					feeTokenWhitelist[channel.depositAsset].min
				)

				return {
					channel,
					balance,
					lastApprovedSigs,
					outstanding,
					outstandingAvailable,
					// mTree,
					bTree,
				}
			})
	)

	const eligible = all.filter(x => {
		return (
			x.outstanding.gt(
				bigNumberify(routineWithdrawTokens[x.channel.depositAsset].minWeekly)
			) && x.outstandingAvailable.gt(bigNumberify('0'))
		)
	})

	return eligible
}

async function getChannelsToSweepFrom({ amountToSweep, identityAddr, wallet }) {
	const allChannels = await getChannelsWithOutstanding({
		identityAddr,
		wallet,
	})

	const { eligible } = allChannels
		.sort((c1, c2) => {
			return c2.outstandingAvailable.gt(c1.outstandingAvailable)
		})
		.reduce(
			(data, c) => {
				const current = { ...data }
				if (current.sum.lt(amountToSweep)) {
					current.eligible.push(c)
				}

				current.sum = current.sum.add(c.outstandingAvailable)

				return current
			},
			{ sum: bigNumberify(0), eligible: [] }
		)

	return eligible
}

const getChannelWithdrawData = ({
	identityAddr,
	balance,
	// mTree,
	bTree,
	lastApprovedSigs,
	ethChannelTuple,
}) => {
	const proof = bTree.getProof(identityAddr)
	const vsig1 = splitSig(lastApprovedSigs[0])
	const vsig2 = splitSig(lastApprovedSigs[1])
	const root = bTree.mTree.getRoot()

	return [ethChannelTuple, root, [vsig1, vsig2], proof, balance]
}

function getSweepExecuteRoutineTx({ txns, identityAddr, routineAuthTuple }) {
	const { routineOpts, withdrawAmountByToken } = txns.reduce(
		(data, tx) => {
			const updated = { ...data }
			updated.routineOpts.push(RoutineOps.channelWithdraw(tx.data))
			updated.withdrawAmountByToken[tx.feeTokenAddr] = (
				data.withdrawAmountByToken[tx.feeTokenAddr] || bigNumberify(0)
			).add(bigNumberify(tx.withdrawAmountByToken[tx.feeTokenAddr]))

			return updated
		},
		{ routineOpts: [], withdrawAmountByToken: {} }
	)

	const data = Identity.functions.executeRoutines.encode([
		routineAuthTuple,
		routineOpts,
	])

	const routinesTx = {
		identityContract: identityAddr,
		to: identityAddr,
		data,
		withdrawAmountByToken,
		routinesTxCount: routineOpts.length,
		routinesSweepTxCount: routineOpts.length,
	}

	return routinesTx
}

function getIdentityRoutineAuthTuple(identity) {
	return identity &&
		identity.relayerData &&
		identity.relayerData.deployData &&
		identity.relayerData.deployData.routineAuthorizationsData &&
		identity.relayerData.deployData.routineAuthorizationsData[0]
		? identity.relayerData.deployData.routineAuthorizationsData[0]
		: null
}

function is41identity(routineAuthTuple) {
	const is41 = routineAuthTuple && routineAuthTuple.length === 5

	return is41
}

function hasValidExecuteRoutines(routineAuthTuple) {
	const hasValidRoutines =
		is41identity(routineAuthTuple) &&
		// TODO: get relayer config for giveUpResubmitAfter
		parseInt(routineAuthTuple[2], 16) * 1000 > Date.now() + 12 * 60 * 60 * 1000

	return hasValidRoutines
}

export async function getSweepChannelsTxns({ account, amountToSweep }) {
	const { wallet, identity } = account
	const { AdExCore } = await getEthers(wallet.authType)
	const identityAddr = identity.address
	const channelsToSweep = await getChannelsToSweepFrom({
		amountToSweep,
		identityAddr,
		wallet,
	})

	const txns = channelsToSweep.map((c, i) => {
		const {
			bTree,
			//  mTree,
			channel,
			lastApprovedSigs,
			outstanding,
			// outstandingAvailable,
			balance,
		} = c
		const ethChannelTuple = toEthereumChannel(channel).toSolidityTuple()

		const data = getChannelWithdrawData({
			identityAddr,
			balance,
			// mTree,
			bTree,
			lastApprovedSigs,
			ethChannelTuple,
		})

		return {
			identityContract: identityAddr,
			to: AdExCore.address,
			feeTokenAddr: channel.depositAsset,
			data,
			withdrawAmountByToken: { [channel.depositAsset]: outstanding },
		}
	})
	const routineAuthTuple = getIdentityRoutineAuthTuple(identity)

	let encodedTxns = null
	if (hasValidExecuteRoutines(routineAuthTuple)) {
		encodedTxns = [
			getSweepExecuteRoutineTx({
				txns,
				identityAddr,
				routineAuthTuple,
			}),
		]
	} else {
		encodedTxns = txns.map(tx => {
			tx.data = Core.functions.channelWithdraw.encode(tx.data)
			tx.isSweepTx = true

			return tx
		})
	}

	return encodedTxns
}

function getSwapAmountsByToken({ balances }) {
	const saiToken = selectSaiToken()
	const { swapsByToken, swapsSumInMainToken } = balances.reduce(
		(swaps, balance) => {
			// TODO: currently work only for SAI to DAI swap
			if (balance.token.address === saiToken.address) {
				swaps.swapsSumInMainToken = swaps.swapsSumInMainToken.add(
					balance.balanceMainToken
				)
				swaps.swapsByToken[balance.token.address] = balance.balance
			}
			return swaps
		},
		{
			swapsSumInMainToken: bigNumberify(0),
			swapsByToken: {},
		}
	)

	return { swapsByToken, swapsSumInMainToken }
}

// NOTE: withdraw from channels + prop for amount to swap by token to main token
// amountNeeded must be in MainToken
export async function getSweepingTxnsIfNeeded({
	amountInMainTokenNeeded,
	account,
}) {
	const needed = bigNumberify(amountInMainTokenNeeded)
	const { identity, wallet } = account
	const { address } = identity
	const { authType } = wallet

	const { balances, mainTokenBalance } = await getWithdrawTokensBalances({
		authType,
		address,
	})

	let currentBalanceInUse = mainTokenBalance

	const sweepData = {
		sweepTxns: [],
		swapAmountsByToken: {},
	}

	if (needed.gt(currentBalanceInUse)) {
		// Swaps
		const { swapsByToken, swapsSumInMainToken } = getSwapAmountsByToken({
			balances,
			amountToSwapInMainToken: needed.sub(currentBalanceInUse),
		})

		sweepData.swapAmountsByToken = swapsByToken
		currentBalanceInUse = currentBalanceInUse.add(swapsSumInMainToken)
	}

	if (needed.gt(currentBalanceInUse)) {
		sweepData.sweepTxns = await getSweepChannelsTxns({
			account,
			amountToSweep: needed.sub(currentBalanceInUse),
		})
	}

	return sweepData
}

export async function openChannel({
	campaign,
	account,
	getFeesOnly,
	getMaxFees,
}) {
	const { wallet, identity, stats } = account
	const { availableIdentityBalanceMainToken } = stats.raw
	const { provider, AdExCore, Identity, getToken } = await getEthers(
		wallet.authType
	)

	const mainToken = selectMainFeeToken()
	const depositAmount = getMaxFees
		? availableIdentityBalanceMainToken
		: parseUnits(campaign.depositAmount, mainToken.decimals).toString()

	const readyCampaign = getReadyCampaign(campaign, identity, mainToken)
	const openReady = readyCampaign.openReady
	const ethChannel = toEthereumChannel(openReady)
	const channel = {
		...openReady,
		id: ethChannel.hashHex(AdExCore.address),
	}
	const identityAddr = openReady.creator
	const feeTokenAddr = mainToken.address

	const routineAuthTuple = getIdentityRoutineAuthTuple(identity)
	const hasIdentityChannelOpen = is41identity(routineAuthTuple)

	const txns = []

	if (hasIdentityChannelOpen) {
		const identityChannelOpenTx = {
			identityContract: identityAddr,
			feeTokenAddr: feeTokenAddr,
			to: identityAddr,
			data: Identity.functions.channelOpen.encode([
				AdExCore.address,
				ethChannel.toSolidityTuple(),
			]),
			extraTxFeesCount: 1,
		}
		txns.push(identityChannelOpenTx)
	} else {
		const approveTxns = await getApproveTxns({
			getToken,
			token: mainToken,
			identityAddr,
			feeTokenAddr: mainToken.address,
			approveForAddress: AdExCore.address,
			approveAmount: depositAmount,
		})

		const channelOpenTx = {
			identityContract: identityAddr,
			feeTokenAddr: feeTokenAddr,
			to: AdExCore.address,
			data: Core.functions.channelOpen.encode([ethChannel.toSolidityTuple()]),
		}
		txns.push(...approveTxns, channelOpenTx)
	}

	const txnsByFeeToken = await getIdentityTxnsWithNoncesAndFees({
		amountInMainTokenNeeded: depositAmount,
		txns,
		identityAddr,
		provider,
		Identity,
		account,
		getToken,
	})

	const fees = await getIdentityTxnsTotalFees({ txnsByFeeToken })
	const mtBalance = bigNumberify(availableIdentityBalanceMainToken)
	const maxAvailable = mtBalance.sub(fees.totalBN)

	if (getFeesOnly) {
		return {
			fees: fees.total,
			maxAvailable,
		}
	}

	const result = await processExecuteByFeeTokens({
		identityAddr,
		txnsByFeeToken,
		wallet,
		provider,
		extraData: { channel },
	})

	readyCampaign.id = channel.id
	return {
		result,
		readyCampaign,
	}
}

export async function closeChannel({ account, campaign }) {
	const result = await closeCampaign({ account, campaign })
	return result
}

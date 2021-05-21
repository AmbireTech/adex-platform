import crypto from 'crypto'
import { Channel, splitSig, RoutineOps } from 'adex-protocol-eth/js'
import BalanceTree from 'adex-protocol-eth/js/BalanceTree'
import { getEthers } from 'services/smart-contracts/ethers'
import {
	getIdentityTxnsWithNoncesAndFees,
	getIdentityTxnsTotalFees,
	processExecuteByFeeTokens,
	getApproveTxns,
} from 'services/smart-contracts/actions/identity'
import { contracts } from '../contractsCfg'
import { closeCampaign } from 'services/adex-validator/actions'
import { Campaign, AdUnit, helpers } from 'adex-models'
import { getCampaigns } from 'services/adex-market/actions'
import { BigNumber, utils } from 'ethers'
import {
	// selectFeeTokenWhitelist,
	selectRoutineWithdrawTokens,
	selectMainFeeToken,
	selectMainToken,
	selectSaiToken,
} from 'selectors'
import { formatTokenAmount } from 'helpers/formatters'
import IdentityABI from 'adex-protocol-eth/abi/Identity'
import { selectChannelsWithUserBalancesEligible } from 'selectors'
import { getState } from 'store'
import { AUTH_TYPES, EXECUTE_ACTIONS } from 'constants/misc'
const { parseUnits, Interface, randomBytes, getAddress } = utils

const { userInputPricingBoundsPerMileToRulesValue } = helpers

const { AdExCore } = contracts
const Core = new Interface(AdExCore.abi)
const IdentityInterface = new Interface(IdentityABI)

const timeframe = 5 * 60 * 1000 // 1 event per 5 minutes
const DAY = 24 * 60 * 60 * 1000
const VALID_UNTIL_FROM_CREATION = 360 * DAY

const OUTSTANDING_STATUSES = {
	Active: true,
	Ready: true,
	Exhausted: true,
	Offline: true,
	Unhealthy: true,
	Withdraw: true,
}

// TODO: get it from the market
const GLOBAL_MIN_CPM = '0.01' // per 1000 user input
const GLOBAL_MAX_CPM = '15.00' // per 1000 user input

const EXTRA_PROCESS_TIME = 48 * 60 * 60 // 48 hours in seconds

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

function getValidUntil(created) {
	return Math.floor((created + VALID_UNTIL_FROM_CREATION) / 1000)
}

function userInputToTokenValue({ input, decimals, divider = 1 }) {
	return parseUnits(input || '0', decimals)
		.div(BigNumber.from(divider))
		.toString()
}

function getReadyCampaign(campaign, identity, mainToken) {
	const { decimals } = mainToken
	const newCampaign = new Campaign(campaign)

	newCampaign.creator = identity.address
	newCampaign.created = Date.now()
	newCampaign.validUntil = getValidUntil(newCampaign.created)
	newCampaign.nonce = BigNumber.from(randomBytes(32)).toString()
	newCampaign.adUnits = newCampaign.adUnits.map(unit => new AdUnit(unit).spec)
	newCampaign.depositAmount = userInputToTokenValue({
		input: newCampaign.depositAmount,
		decimals,
	})

	const validators = newCampaign.validators.map(v => {
		const deposit = BigNumber.from(newCampaign.depositAmount || 0)
		const fee = deposit
			.mul(BigNumber.from(v.feeNum || 1))
			.div(BigNumber.from(v.feeDen || 1))
			.toString()

		const validator = {
			id: v.id,
			url: v.url,
			fee,
		}

		if (v.feeAddr) {
			validator.feeAddr = v.feeAddr
		}

		return validator
	})

	newCampaign.validators = validators

	// spec pricing bounds
	const pricingBounds = userInputPricingBoundsPerMileToRulesValue({
		pricingBounds: {
			IMPRESSION: {
				min: GLOBAL_MIN_CPM,
				max: GLOBAL_MAX_CPM,
			},
		},
		decimals,
	})

	// TODO: CLICK when available
	newCampaign.pricingBounds = pricingBounds

	// TEMP: legacy compatibility
	newCampaign.minPerImpression = pricingBounds.IMPRESSION.min
	newCampaign.maxPerImpression = pricingBounds.IMPRESSION.max

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
		humanFriendlyName: 'Pending',
		lastChecked: Date.now(),
	}

	return newCampaign
}

const getWithdrawnPerUserOutstanding = async ({
	channel,
	balance,
	identityAddr,
}) => {
	const { AdExCore } = await getEthers(AUTH_TYPES.READONLY)
	const withdrawnPerUser = await AdExCore.functions.withdrawnPerUser(
		channel.id,
		identityAddr
	)

	const outstanding = BigNumber.from(balance.toString()).sub(
		BigNumber.from(withdrawnPerUser[0])
	)

	return outstanding
}

export async function getChannelsWithOutstanding({ identityAddr }) {
	const channels = await getCampaigns({ all: true, byEarner: identityAddr })

	// const feeTokenWhitelist = selectFeeTokenWhitelist()
	const routineWithdrawTokens = selectRoutineWithdrawTokens()

	const allChannels = await Promise.all(
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
					lastApprovedBalances,
					bTree,
					channel,
				}
			})
			.filter(({ bTree }) => {
				return bTree && !bTree.getBalance(identityAddr).isZero()
			})
			.map(
				async ({ channel, lastApprovedSigs, lastApprovedBalances, bTree }) => {
					//  mTree,
					const balance = bTree.getBalance(identityAddr).toString()

					const outstanding = await getWithdrawnPerUserOutstanding({
						channel,
						balance,
						identityAddr,
					})

					// const outstandingAvailable = outstanding.sub(
					// 	BigNumber.from(feeTokenWhitelist[channel.depositAsset].min)
					// )

					// NOTE: We will show everything - will add this to withdraw fees
					const outstandingAvailable = outstanding

					const balanceNum = BigNumber.from(channel.depositAmount)
						.sub(BigNumber.from(channel.spec.validators[0].fee || 0))
						.sub(BigNumber.from(channel.spec.validators[1].fee || 0))

					return {
						channel,
						balance,
						lastApprovedSigs,
						outstanding,
						outstandingAvailable,
						lastApprovedBalances,
						balanceNum,
					}
				}
			)
	)

	const all = Object.assign(
		{},
		...allChannels.map(c => {
			const { channel, balance } = c
			const { id, depositAmount, depositAsset, status, spec } = channel
			const balanceNum = BigNumber.from(depositAmount)
				.sub(BigNumber.from(c.channel.spec.validators[0].fee))
				.sub(BigNumber.from(c.channel.spec.validators[1].fee))
				.toString()

			return {
				[c.channel.id.toLowerCase()]: {
					id,
					balance,
					depositAmount,
					depositAsset,
					balanceNum,
					status: status.name,
					adUnits: spec.adUnits, //TODO: add only what needed
				},
			}
		})
	)

	const withOutstandingBalanceAll = allChannels.filter(x => {
		return (
			OUTSTANDING_STATUSES[x.channel.status.name] &&
			new Date((x.channel.validUntil - EXTRA_PROCESS_TIME) * 1000) >
				Date.now() &&
			x.outstandingAvailable.gt(BigNumber.from('0'))
		)
	})

	const withOutstandingBalance = [...withOutstandingBalanceAll].filter(x =>
		// Used for withdraw and all functions requiring sweeps
		x.outstanding.gt(
			BigNumber.from(routineWithdrawTokens[x.channel.depositAsset].minPlatform)
		)
	)

	return { all, withOutstandingBalanceAll, withOutstandingBalance }
}

async function getChannelsToSweepFrom({ amountToSweep, withBalance = [] }) {
	const { eligible } = withBalance
		.sort((c1, c2) => {
			return BigNumber.from(c2.outstandingAvailable).gt(
				BigNumber.from(c1.outstandingAvailable)
			)
		})
		.reduce(
			(data, c) => {
				const current = { ...data }
				if (current.sum.lt(amountToSweep)) {
					current.eligible.push(c)
					current.sum = current.sum.add(BigNumber.from(c.outstandingAvailable))
				}

				return current
			},
			{ sum: BigNumber.from(0), eligible: [] }
		)

	return eligible
}

const getChannelWithdrawData = ({
	identityAddr,
	balance,
	lastApprovedBalances,
	lastApprovedSigs,
	ethChannelTuple,
}) => {
	const bTree = new BalanceTree(lastApprovedBalances)
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
				data.withdrawAmountByToken[tx.feeTokenAddr] || BigNumber.from(0)
			).add(BigNumber.from(tx.withdrawAmountByToken[tx.feeTokenAddr]))

			return updated
		},
		{ routineOpts: [], withdrawAmountByToken: {} }
	)

	const data = IdentityInterface.encodeFunctionData('executeRoutines', [
		routineAuthTuple,
		routineOpts,
	])

	const routinesTx = {
		identityContract: identityAddr,
		to: identityAddr,
		data,
		withdrawAmountByToken,
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
		parseInt((routineAuthTuple[2], 16) - EXTRA_PROCESS_TIME) * 1000 > Date.now()

	return hasValidRoutines
}

export async function getSweepChannelsTxns({ account, amountToSweep }) {
	const { identity } = account
	// TODO: pass withBalance as prop
	const withBalance = selectChannelsWithUserBalancesEligible(getState())

	const { AdExCore } = await getEthers(AUTH_TYPES.READONLY)
	const identityAddr = identity.address
	const channelsToSweep = await getChannelsToSweepFrom({
		amountToSweep,
		identityAddr,
		withBalance,
	})

	const txns = channelsToSweep.map((c, i) => {
		const {
			lastApprovedBalances,
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
			lastApprovedBalances,
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
			tx.data = Core.encodeFunctionData('channelWithdraw', tx.data)
			tx.isSweepTx = true

			return tx
		})
	}

	return encodedTxns
}

function getSwapAmountsByToken({ balances }) {
	const mainToken = selectMainToken()
	const saiToken = selectSaiToken()
	const { swapsByToken, swapsSumInMainToken } = balances.reduce(
		(swaps, balance) => {
			// TODO: currently work only for SAI to DAI swap
			if (
				saiToken &&
				saiToken.address &&
				balance.token.address !== mainToken.address &&
				// TEMP: remove that check when all tokens swaps are available
				balance.token.address === saiToken.address
			) {
				swaps.swapsSumInMainToken = swaps.swapsSumInMainToken.add(
					balance.balanceMainToken
				)
				swaps.swapsByToken[balance.token.address] = balance.balance
			}
			return swaps
		},
		{
			swapsSumInMainToken: BigNumber.from(0),
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
	const needed = BigNumber.from(amountInMainTokenNeeded)
	const {
		balances,
		mainTokenBalance,
	} = account.stats.raw.identityWithdrawTokensBalancesBalances

	let currentBalanceInUse = BigNumber.from(mainTokenBalance)

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

export function getChannelId({ campaign, account }) {
	const { identity } = account
	const mainToken = selectMainFeeToken()

	const readyCampaign = getReadyCampaign(campaign, identity, mainToken)
	const openReady = readyCampaign.openReady
	const ethChannel = toEthereumChannel(openReady)
	const id = ethChannel.hashHex(AdExCore.address)

	return id
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
			data: IdentityInterface.encodeFunctionData('channelOpen', [
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
			data: Core.encodeFunctionData('channelOpen', [
				ethChannel.toSolidityTuple(),
			]),
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
		executeAction: EXECUTE_ACTIONS.openCampaign,
	})

	const {
		total,
		totalBN,
		breakdownFormatted,
	} = await getIdentityTxnsTotalFees({ txnsByFeeToken })
	const bigZero = BigNumber.from(0)
	const mtBalance = BigNumber.from(availableIdentityBalanceMainToken)
	const maxAvailable = mtBalance.sub(totalBN).lt(bigZero)
		? bigZero
		: mtBalance.sub(totalBN)
	const maxAvailableFormatted = formatTokenAmount(
		maxAvailable.toString(),
		mainToken.decimals || 18,
		false,
		2
	)

	if (getFeesOnly) {
		return {
			feesFormatted: total,
			fees: totalBN,
			maxAvailable,
			maxAvailableFormatted,
			breakdownFormatted,
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
	const storeCampaign = { ...readyCampaign }
	storeCampaign.spec = { ...openReady.spec }
	return {
		result,
		storeCampaign,
	}
}

export async function closeChannel({ account, campaign }) {
	const result = await closeCampaign({ account, campaign })
	return result
}

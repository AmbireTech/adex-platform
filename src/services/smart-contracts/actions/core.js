import crypto from 'crypto'
import {
	Channel,
	MerkleTree,
	splitSig,
	ChannelState,
} from 'adex-protocol-eth/js'
import { getEthers } from 'services/smart-contracts/ethers'
import { getIdentityTnxsWithNonces } from 'services/smart-contracts/actions/identity'
import {
	getSigner,
	getMultipleTxSignatures,
} from 'services/smart-contracts/actions/ethers'
import { contracts } from '../contractsCfg'
import { sendOpenChannel } from 'services/adex-relayer/actions'
import { closeCampaign } from 'services/adex-validator/actions'
import { Campaign, AdUnit } from 'adex-models'
import { getAllCampaigns } from 'services/adex-market/actions'
import {
	bigNumberify,
	randomBytes,
	parseUnits,
	Interface,
	formatUnits,
} from 'ethers/utils'
import { formatTokenAmount } from 'helpers/formatters'
import { relayerConfig } from 'services/adex-relayer'

const { AdExCore, DAI } = contracts
const Core = new Interface(AdExCore.abi)
const ERC20 = new Interface(DAI.abi)
const feeAmountApprove = '150000000000000000'
const feeAmountTransfer = '150000000000000000'
const feeAmountOpen = '160000000000000000'
const timeframe = 15 * 1000 // 1 event per 15 seconds
const VALID_UNTIL_COEFFICIENT = 0.5
const VALID_UNTIL_MIN_PERIOD = 7 * 24 * 60 * 60 * 1000 // 7 days in ms

export const totalFeesFormatted = formatUnits(
	bigNumberify(feeAmountApprove)
		.add(bigNumberify(feeAmountOpen))
		.toString(),
	18
)

function toEthereumChannel(channel) {
	const specHash = crypto
		.createHash('sha256')
		.update(JSON.stringify(channel.spec))
		.digest()

	return new Channel({
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

function getReadyCampaign(campaign, identity, Dai) {
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
		newCampaign.depositAmount,
		DAI.decimals
	).toString()

	// NOTE: TEMP in UI its set per 1000 impressions (CPM)
	newCampaign.minPerImpression = parseUnits(
		newCampaign.minPerImpression,
		DAI.decimals
	)
		.div(bigNumberify(1000))
		.toString()
	newCampaign.maxPerImpression = newCampaign.minPerImpression

	newCampaign.depositAsset = newCampaign.depositAsset || Dai.address
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

	newCampaign.status = { name: 'Pending', lastChecked: Date.now() }

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
	const { feeTokenWhitelist = {} } = relayerConfig()
	const channelWithdrawFee = bigNumberify(
		feeTokenWhitelist.min || feeAmountTransfer
	)

	const all = await Promise.all(
		channels
			.map(channel => {
				const { lastApprovedSigs, lastApprovedBalances } = channel.status
				if (lastApprovedBalances) {
					const allLeafs = Object.entries(lastApprovedBalances).map(([k, v]) =>
						Channel.getBalanceLeaf(k, v)
					)
					const mTree = new MerkleTree(allLeafs)
					return { lastApprovedSigs, lastApprovedBalances, mTree, channel }
				} else {
					return {
						lastApprovedSigs: null,
						lastApprovedBalances: null,
						mTree: null,
						channel,
					}
				}
			})
			.filter(({ channel, lastApprovedBalances }) => {
				if (!!channel.status && channel.status.name === 'Expired') {
					return channel.creator === identityAddr
				}
				return lastApprovedBalances && !!lastApprovedBalances[identityAddr]
			})
			.map(
				async ({ channel, lastApprovedBalances, lastApprovedSigs, mTree }) => {
					const balance = lastApprovedBalances[identityAddr]

					const outstanding =
						channel.status.name === 'Expired'
							? await getExpiredWithdrawnOutstanding({ channel, AdExCore })
							: await getWithdrawnPerUserOutstanding({
									AdExCore,
									channel,
									balance,
									identityAddr,
							  })

					const outstandingAvailable = bigNumberify(outstanding).sub(
						channelWithdrawFee
					)

					return {
						channel,
						balance,
						lastApprovedBalances,
						lastApprovedSigs,
						outstanding,
						outstandingAvailable,
						mTree,
					}
				}
			)
	)

	return all
}

async function getChannelsToSweepFrom({ amountToSweep, identityAddr, wallet }) {
	const allChannels = await getChannelsWithOutstanding({
		identityAddr,
		wallet,
	})

	const bigZero = bigNumberify(0)

	const { eligible } = allChannels
		.filter(c => {
			const { outstandingAvailable } = c
			return outstandingAvailable.gt(bigZero)
		})
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
			{ sum: bigZero, eligible: [] }
		)

	return eligible
}

const getChannelWithdrawData = ({
	identityAddr,
	balance,
	mTree,
	lastApprovedSigs,
	ethChannelTuple,
}) => {
	const leaf = Channel.getBalanceLeaf(identityAddr, balance)
	const proof = mTree.proof(leaf)
	const vsig1 = splitSig(lastApprovedSigs[0])
	const vsig2 = splitSig(lastApprovedSigs[1])

	Core.functions.channelWithdraw.encode([
		ethChannelTuple,
		mTree.getRoot(),
		[vsig1, vsig2],
		proof,
		balance,
	])
}

export async function getSweepChannelsTxns({
	feeTokenAddr,
	account,
	amountToSweep,
}) {
	const { wallet, identity } = account
	const { Dai, AdExCore } = await getEthers(wallet.authType)
	const identityAddr = identity.address
	const channelsToSweep = await getChannelsToSweepFrom({
		amountToSweep,
		identityAddr,
		wallet,
	})

	const txns = channelsToSweep.map((c, i) => {
		const { mTree, channel, lastApprovedSigs, balance } = c
		const ethChannelTuple = toEthereumChannel(channel).toSolidityTuple()

		const data =
			channel.status.name === 'Expired'
				? Core.functions.channelWithdrawExpired.encode([ethChannelTuple])
				: getChannelWithdrawData({
						identityAddr,
						balance,
						mTree,
						lastApprovedSigs,
						ethChannelTuple,
				  })

		return {
			identityContract: identityAddr,
			to: AdExCore.address,
			feeTokenAddr: feeTokenAddr || Dai.address,
			feeAmount: feeAmountTransfer, // Same fee as withdrawFromIdentity
			data,
		}
	})

	return txns
}

export async function getSweepingTxnsIfNeeded({ amountNeeded, account }) {
	const needed = bigNumberify(amountNeeded)
	const accountBalance = bigNumberify(account.stats.raw.identityBalanceDai)
	if (needed.gt(accountBalance)) {
		return await getSweepChannelsTxns({
			account,
			amountToSweep: needed.sub(accountBalance),
		})
	} else {
		return []
	}
}

export async function openChannel({ campaign, account, getFeesOnly }) {
	const { wallet, identity } = account
	const { provider, AdExCore, Dai, Identity } = await getEthers(wallet.authType)
	const depositAmount = parseUnits(campaign.depositAmount)
	const sweepTxns = await getSweepingTxnsIfNeeded({
		amountNeeded: depositAmount,
		account,
	})
	const sweepFees = sweepTxns.reduce(
		(total, tx) => total.add(bigNumberify(tx.feeAmount)),
		bigNumberify(0)
	)

	const fees = bigNumberify(feeAmountApprove)
		.add(bigNumberify(feeAmountOpen))
		.add(sweepFees)

	if (getFeesOnly) {
		return {
			fees: formatTokenAmount(fees.toString(), 18),
		}
	}

	const readyCampaign = getReadyCampaign(campaign, identity, Dai)
	const openReady = readyCampaign.openReady
	const ethChannel = toEthereumChannel(openReady)
	const signer = await getSigner({ wallet, provider })
	const channel = {
		...openReady,
		id: ethChannel.hashHex(AdExCore.address),
	}
	const identityAddr = openReady.creator

	const feeTokenAddr = campaign.temp.feeTokenAddr || Dai.address

	const tx1 = {
		identityContract: identityAddr,
		feeTokenAddr: feeTokenAddr,
		feeAmount: feeAmountApprove,
		to: Dai.address,
		data: ERC20.functions.approve.encode([
			AdExCore.address,
			channel.depositAmount,
		]),
	}

	const tx2 = {
		identityContract: identityAddr,
		feeTokenAddr: feeTokenAddr,
		feeAmount: feeAmountOpen,
		to: AdExCore.address,
		data: Core.functions.channelOpen.encode([ethChannel.toSolidityTuple()]),
	}
	const txns = [...sweepTxns, tx1, tx2]
	const txnsRaw = await getIdentityTnxsWithNonces({
		txns,
		identityAddr,
		provider,
		Identity,
	})

	const signatures = await getMultipleTxSignatures({ txns: txnsRaw, signer })

	const data = {
		txnsRaw,
		signatures,
		channel,
		identityAddr,
	}

	const result = await sendOpenChannel(data)
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

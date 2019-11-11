import crypto from 'crypto'
import { Channel, MerkleTree, splitSig } from 'adex-protocol-eth/js'
import { getEthers } from 'services/smart-contracts/ethers'
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
import { Contract } from 'ethers'

const { AdExCore, DAI } = contracts
const Core = new Interface(AdExCore.abi)
const ERC20 = new Interface(DAI.abi)
const feeAmountApprove = '150000000000000000'
const feeAmountTransfer = '150000000000000000'
const feeAmountOpen = '160000000000000000'
const timeframe = 15000 // 1 event per 15 seconds
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

async function getChannelsWithOutstanding({ identityAddr, wallet }) {
	const channels = await getAllCampaigns(true)
	return Promise.all(
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
				if (channel.status.name === 'Expired') {
					return channel.creator === identityAddr
				}
				return lastApprovedBalances && !!lastApprovedBalances[identityAddr]
			})
			.map(async ({ channel, lastApprovedBalances, mTree }) => {
				const { authType } = wallet
				const { AdExCore } = await getEthers(authType)
				const outstanding =
					channel.status.name === 'Expired'
						? bigNumberify(channel.depositAmount).sub(
								await AdExCore.functions.withdrawn(channel.id)
						  )
						: bigNumberify(lastApprovedBalances[identityAddr]).sub(
								await AdExCore.functions.withdrawnPerUser(
									channel.id,
									identityAddr
								)
						  )
				const outstandingMinusFee = bigNumberify(outstanding).sub(
					bigNumberify(feeAmountTransfer)
				)
				return {
					channel,
					balance: lastApprovedBalances[identityAddr],
					outstanding,
					outstandingMinusFee,
					mTree,
				}
			})
			.filter(async res => {
				const { outstandingMinusFee } = await res
				return outstandingMinusFee.gt(0)
			})
	)
}

async function getChannelsToSweepFrom({ amountToSweep, identityAddr, wallet }) {
	const allChannels = await getChannelsWithOutstanding({
		identityAddr,
		wallet,
	})
	const channelsSorted = allChannels.sort((c1, c2) => {
		return c2.outstandingMinusFee.gt(c1.outstandingMinusFee)
	})
	// Could be done with map/reduce but figured this for loop is much simpler in this case
	const channelsToWithdrawFrom = []
	let sum = bigNumberify('0')
	for (const c of channelsSorted) {
		if (sum.gte(bigNumberify(amountToSweep))) {
			break
		}
		sum = sum.add(c.outstandingMinusFee)
		channelsToWithdrawFrom.push(c)
	}
	return channelsToWithdrawFrom
}

export async function sweepChannels({ feeTokenAddr, account, amountToSweep }) {
	const { wallet } = account
	const { provider, Dai, Identity } = await getEthers(wallet.authType)
	const identityAddr = account.identity.address
	const channelsToSweep = await getChannelsToSweepFrom({
		amountToSweep,
		identityAddr,
		wallet,
	})
	const identityContract = new Contract(identityAddr, Identity.abi, provider)
	const initialNonce = (await identityContract.nonce()).toNumber()

	const txns = channelsToSweep.map((c, i) => {
		const { mTree, channel } = c
		const leaf = Channel.getBalanceLeaf(
			identityAddr,
			channel.status.lastApprovedBalances[identityAddr]
		)
		const proof = mTree.proof(leaf)
		const vsig1 = splitSig(channel.status.lastApprovedSigs[0])
		const vsig2 = splitSig(channel.status.lastApprovedSigs[1])
		const data =
			channel.status.name === 'Expired'
				? Core.functions.channelWithdrawExpired.encode([
						toEthereumChannel(channel).toSolidityTuple(),
				  ])
				: Core.functions.channelWithdraw.encode([
						toEthereumChannel(channel).toSolidityTuple(),
						mTree.getRoot(),
						[vsig1, vsig2],
						proof,
						channel.status.lastApprovedBalances[identityAddr],
				  ])

		return {
			identityContract: identityAddr,
			nonce: initialNonce + i,
			from: channel.id,
			to: identityAddr,
			feeTokenAddr: feeTokenAddr || Dai.address,
			feeAmount: feeAmountTransfer, // Same fee as withdrawFromIdentity
			data,
		}
	})

	return txns
}

export async function openChannel({ campaign, account, sweepTxns }) {
	const { wallet, identity } = account
	const { provider, AdExCore, Dai, Identity } = await getEthers(wallet.authType)

	const readyCampaign = getReadyCampaign(campaign, identity, Dai)
	const openReady = readyCampaign.openReady
	const ethChannel = toEthereumChannel(openReady)
	const signer = await getSigner({ wallet, provider })
	const channel = {
		...openReady,
		id: ethChannel.hashHex(AdExCore.address),
	}
	const identityAddr = openReady.creator
	const identityContract = new Contract(identityAddr, Identity.abi, provider)
	const initialNonce = (await identityContract.nonce()).toNumber()

	const feeTokenAddr = campaign.temp.feeTokenAddr || Dai.address

	const tx1 = {
		identityContract: identityAddr,
		nonce: initialNonce,
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
		nonce: initialNonce + 1,
		feeTokenAddr: feeTokenAddr,
		feeAmount: feeAmountOpen,
		to: AdExCore.address,
		data: Core.functions.channelOpen.encode([ethChannel.toSolidityTuple()]),
	}
	const txns = sweepTxns ? [...sweepTxns, tx1, tx2] : [tx1, tx2]
	const signatures = await getMultipleTxSignatures({ txns, signer })

	const data = {
		txnsRaw: txns,
		signatures,
		channel,
		identityAddr: identity.address,
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

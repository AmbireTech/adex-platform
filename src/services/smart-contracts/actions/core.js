import crypto from 'crypto'
import Requester from 'services/requester'
import {
	Channel,
	MerkleTree,
	// splitSig,
	// Transaction
} from 'adex-protocol-eth/js'
import { getEthers } from 'services/smart-contracts/ethers'
import {
	getSigner,
	getMultipleTxSignatures,
} from 'services/smart-contracts/actions/ethers'
import { contracts } from '../contractsCfg'
import { sendOpenChannel, executeTx } from 'services/adex-relayer/actions'
import { closeCampaign } from 'services/adex-validator/actions'
import { Campaign, AdUnit } from 'adex-models'
import {
	bigNumberify,
	randomBytes,
	parseUnits,
	Interface,
	formatUnits,
} from 'ethers/utils'
import { Contract, providers } from 'ethers'
import { BN } from 'ethereumjs-util'

const { AdExCore, DAI } = contracts
const Core = new Interface(AdExCore.abi)
const ERC20 = new Interface(DAI.abi)
const feeAmountApprove = '150000000000000000'
const feeAmountTransfer = '150000000000000000'
const feeAmountOpen = '160000000000000000'
const timeframe = 15000 // 1 event per 15 seconds
const VALID_UNTIL_COEFFICIENT = 0.5
const VALID_UNTIL_MIN_PERIOD = 7 * 24 * 60 * 60 * 1000 // 7 days in ms
const ADEX_MARKET_HOST = process.env.ADEX_MARKET_HOST

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

async function getChannelsWithBalance({ identityAddr, requester, STATES }) {
	const channels = await requester
		.fetch({
			route: '/campaigns',
			method: 'GET',
			queryParams: {
				status: STATES.join(','),
			},
		})
		.then(res => res.json())

	return Promise.all(
		channels
			.map(channel => {
				const { lastApprovedBalances } = channel.status
				if (lastApprovedBalances) {
					const allLeafs = Object.keys(lastApprovedBalances).map(k =>
						Channel.getBalanceLeaf(k, lastApprovedBalances[k])
					)
					const mTree = new MerkleTree(allLeafs)
					return { lastApprovedBalances, mTree, channel }
				} else {
					return { lastApprovedBalances: null, mTree: null, channel }
				}
			})
			.filter(({ channel, lastApprovedBalances }) => {
				if (channel.status.name === 'Expired') {
					return channel.creator === identityAddr
				}
				return lastApprovedBalances && !!lastApprovedBalances[identityAddr]
			})
			.map(({ channel, lastApprovedBalances }) => ({
				channel,
				balance: lastApprovedBalances[identityAddr],
			}))
			.sort((c1, c2) => {
				// Sorting by most balance so we can get top N needed using amountToSweep so we send as few transactions as possible
				return new BN(c2.status.lastApprovedBalances[identityAddr]).gte(
					new BN(c1.status.lastApprovedBalances[identityAddr])
				)
			})
	)
}

async function getChannelsToSweepFrom({ amountToSweep, identityAddr }) {
	const STATES = [
		'Active',
		'Ready',
		'Exhausted',
		'Offline',
		'Unhealthy',
		'Withdraw',
		'Expired',
	]

	const requester = new Requester({ baseUrl: ADEX_MARKET_HOST })
	const allChannels = await getChannelsWithBalance({
		identityAddr,
		requester,
		STATES,
	})

	// Could be done with map/reduce but figured this for loop is much simpler in this case
	const channelsToWithdrawFrom = []
	const sum = new BN('0')
	for (let i = 0; i < allChannels.length; i++) {
		if (sum.gte(new BN(amountToSweep))) {
			break
		}
		const balance = new BN(
			allChannels[i].status.lastApprovedBalances[identityAddr]
		)
		sum.iadd(balance)
		channelsToWithdrawFrom.push(allChannels[i])
	}

	return channelsToWithdrawFrom
}

export async function sweepChannels({ campaign, account }) {
	// Assuming there would be enough outstanding balance due to validations working, if not relayer will return error
	const amountToSweep =
		parseFloat(campaign.depositAmount) -
		parseFloat(account.stats.formatted.identityBalanceDai)
	const { wallet } = account
	const { provider, Dai, Identity } = await getEthers(wallet.authType)
	const identityAddr = account.identity.address
	const channelsToSweep = await getChannelsToSweepFrom({
		amountToSweep,
		identityAddr,
	})
	const identityContract = new Contract(identityAddr, Identity.abi, provider)
	const initialNonce = (await identityContract.nonce()).toNumber()
	const feeTokenAddr = campaign.temp.feeTokenAddr || Dai.address

	const txns = channelsToSweep.map((c, i) => {
		const toWithdraw = c.status.lastApprovedBalances[identityAddr]
		return {
			identityContract: identityAddr,
			nonce: initialNonce + i,
			from: c.id,
			to: identityAddr,
			feeTokenAddr,
			feeAmount: feeAmountTransfer, // Same fee as withdrawFromIdentity
			data: ERC20.functions.transfer.encode([identityAddr, toWithdraw]),
		}
	})

	const signer = await getSigner({ wallet, provider })

	const signatures = await getMultipleTxSignatures({ txns, signer })
	const data = {
		txnsRaw: txns,
		signatures,
		identityAddr,
	}

	const result = await executeTx(data)
	return {
		result,
	}
}

export async function openChannel({ campaign, account }) {
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

	const txns = [tx1, tx2]
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

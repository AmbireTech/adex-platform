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
import { Contract } from 'ethers'
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

async function getChannelsToSweepFrom({ amountToSweep, identityAddr }) {
	const STATES = [
		'Active',
		'Ready',
		'Exhausted',
		'Offline',
		'Unhealthy',
		'Withdraw',
	]
	const requester = new Requester({ baseUrl: ADEX_MARKET_HOST })
	const channels = await requester
		.fetch({
			route: '/campaigns',
			method: 'GET',
			queryParams: {
				status: STATES.join(','),
			},
		})
		.then(res => res.json())
	const activeChannels = Promise.all(
		channels
			.map(async channel => {
				const url = `${channel.spec.validators[0].url}/channel/${channel.id}/last-approved`
				const { lastApproved } = await fetch(url).then(r => r.json())
				if (lastApproved) {
					const balancesTree = lastApproved.newState.msg.balances
					const allLeafs = Object.keys(balancesTree).map(k =>
						Channel.getBalanceLeaf(k, balancesTree[k])
					)
					const mTree = new MerkleTree(allLeafs)
					return { lastApproved, mTree, channel }
				} else {
					return { lastApproved: null, mTree: null, channel }
				}
			})
			.filter(
				({ lastApproved }) =>
					lastApproved && !!lastApproved.newState.msg.balances[identityAddr]
			)
			.map(({ channel, lastApproved }) => ({
				channel,
				balance: lastApproved.newState.msg.balances[identityAddr],
			}))
			.sort((c1, c2) => {
				// Sorting by most balance so we can get top N needed using amountToSweep so we send as few transactions as possible
				return new BN(c2.lastApproved.newState.msg.balances[identityAddr]).gte(
					new BN(c1.lastApproved.newState.msg.balances[identityAddr])
				)
			})
	)

	// Could be done with map/reduce but figured this for loop is much simpler in this case
	const channelsToWithdrawFrom = []
	const sum = new BN('0')
	for (let i = 0; i < activeChannels.length; i++) {
		if (sum.gte(new BN(amountToSweep))) {
			break
		}
		const balance = new BN(
			activeChannels[i].lastApproved.newState.msg.balances[identityAddr]
		)
		sum.iadd(balance)
		channelsToWithdrawFrom.push(activeChannels[i])
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
		const toWithdraw = c.lastApproved.newState.msg.balances[identityAddr]
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

import { getEthers } from 'services/smart-contracts/ethers'
import { constants } from 'adex-models'
import { utils, Contract } from 'ethers'
import { getAllCampaigns } from 'services/adex-market/actions'
import {
	lastApprovedState,
	getValidatorAuthToken,
	identityAnalytics,
} from 'services/adex-validator/actions'
import { bigNumberify } from 'ethers/utils'
import { Channel, MerkleTree } from 'adex-protocol-eth/js'

const { formatEther, formatUnits } = utils
const privilegesNames = constants.valueToKey(constants.IdentityPrivilegeLevel)

export async function getAddressBalances({ address, authType }) {
	const { provider, Dai } = await getEthers(authType)

	const calls = [
		provider.getBalance(address.address),
		Dai.balanceOf(address.address),
	]

	const balances = await Promise.all(calls)
	const formatted = {
		address: address.address,
		path: address.serializedPath || address.path, // we are going to keep the entire path
		balanceEth: balances[0].toString(),
		balanceDai: balances[1].toString(),
	}

	return formatted
}

export async function getAccountStats({
	account,
	outstandingBalanceDai = bigNumberify(0),
}) {
	const { wallet, identity } = account
	const { provider, Dai, Identity } = await getEthers(wallet.authType)

	const { status = {} } = identity
	const identityContract = new Contract(
		identity.address,
		Identity.abi,
		provider
	)
	let privilegesAction
	try {
		await identityContract.deployed()
		privilegesAction = identityContract.privileges(wallet.address)
	} catch {
		privilegesAction = Promise.resolve(status.type || 'Not Deployed')
	}

	const calls = [
		provider.getBalance(wallet.address),
		Dai.balanceOf(wallet.address),
		Dai.balanceOf(identity.address),
		privilegesAction,
	]

	const [
		walletBalanceEth,
		walletBalanceDai,
		identityBalanceDai = bigNumberify(0),
		walletPrivileges,
	] = await Promise.all(
		calls.map(c =>
			c
				.then(res => res)
				.catch(e => {
					return undefined
				})
		)
	)

	// BigNumber values for balances
	const raw = {
		walletBalanceEth,
		walletBalanceDai,
		identityBalanceDai,
		walletPrivileges,
		outstandingBalanceDai,
		totalIdentityBalanceDai: identityBalanceDai.add(outstandingBalanceDai),
	}

	const formatted = {
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivileges: privilegesNames[walletPrivileges],
		walletBalanceEth: formatEther(walletBalanceEth),
		walletBalanceDai: formatUnits(walletBalanceDai, 18),
		identityAddress: identity.address,
		identityBalanceDai: formatUnits(identityBalanceDai, 18),
		outstandingBalanceDai: formatUnits(outstandingBalanceDai, 18),
		totalIdentityBalanceDai: formatUnits(raw.totalIdentityBalanceDai, 18),
	}

	return {
		raw,
		formatted,
	}
}

async function getAllChannels() {
	const channels = await getAllCampaigns(true)
	return Promise.all(
		channels.map(async channel => {
			const { lastApproved } = await lastApprovedState({ campaign: channel })

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
	)
}

async function getAllChannelsWhereHasBalance(allActive, addr) {
	return allActive
		.filter(
			({ lastApproved }) =>
				lastApproved && !!lastApproved.newState.msg.balances[addr]
		)
		.map(({ channel, lastApproved }) => ({
			channel,
			balance: lastApproved.newState.msg.balances[addr],
		}))
}

export async function getOutstandingBalance({ wallet, address, withBalance }) {
	const { authType } = wallet
	const { AdExCore } = await getEthers(authType)

	const withOutstanding = await Promise.all(
		withBalance.map(async ({ channel, balance }) => {
			const outstanding = bigNumberify(balance).sub(
				await AdExCore.withdrawnPerUser(channel.id, address)
			)
			return { channel, outstanding }
		})
	)

	const totalOutstanding = withOutstanding.reduce((sum, ch) => {
		const currentSum = sum.add(ch.outstanding)
		return currentSum
	}, bigNumberify('0'))

	return totalOutstanding || bigNumberify('0')
}

export async function getAllValidatorsAuthForIdentity({
	withBalance,
	account,
}) {
	const validatorAuthTokens = account.identity.validatorAuthTokens || {}

	const allValidators = withBalance.reduce((all, { channel }) => {
		const leader = (channel.validators || channel.spec.validators)[0].id
		const follower = (channel.validators || channel.spec.validators)[1].id

		const validators = {
			...all,
			[leader]: all[leader] || validatorAuthTokens[leader] || null,
			[follower]: all[follower] || validatorAuthTokens[follower] || null,
		}

		return validators
	}, {})

	const keys = Object.keys(allValidators)

	const tokenCalls = keys.map(async key => {
		if (allValidators[key]) {
			return allValidators[key]
		} else {
			const token = await getValidatorAuthToken({
				validatorId: key,
				account,
			})

			return token
		}
	})

	const allTokens = await Promise.all(tokenCalls)

	const validatorsAuth = keys.reduce((all, key, index) => {
		const validators = {
			...all,
			[key]: allTokens[index],
		}

		return validators
	}, {})

	return validatorsAuth
}

export async function getIdentityStatistics({
	withBalance,
	address,
	account = {},
	leaderAuth,
} = {}) {
	const callsParams = [
		// Publisher
		{
			metric: 'eventPayouts',
			timeframe: 'hour',
			for: 'publisher',
		},
		{
			metric: 'eventPayouts',
			timeframe: 'day',
			for: 'publisher',
		},
		{
			metric: 'eventPayouts',
			timeframe: 'week',
			for: 'publisher',
		},
		{
			metric: 'eventPayouts',
			timeframe: 'month',
			for: 'publisher',
		},
		{
			metric: 'eventPayouts',
			timeframe: 'year',
			for: 'publisher',
		},
		// // Advertiser
		{
			metric: 'eventCounts',
			timeframe: 'hour',
			for: 'advertiser',
		},
		{
			metric: 'eventCounts',
			timeframe: 'day',
			for: 'advertiser',
		},
		{
			metric: 'eventCounts',
			timeframe: 'week',
			for: 'advertiser',
		},
		{
			metric: 'eventCounts',
			timeframe: 'month',
			for: 'advertiser',
		},
		{
			metric: 'eventCounts',
			timeframe: 'year',
			for: 'advertiser',
		},
	]

	const allCalls = callsParams.map(async opts => {
		const aggr = identityAnalytics({
			...opts,
			leaderAuth,
		})
		return aggr
	})

	const results = await Promise.all(
		allCalls.map((ag, index) => {
			const params = callsParams[index]

			return ag
				.then(res => {
					return { ...res, ...params }
				})
				.catch(e => {
					return {
						...params,
						aggr: [],
					}
				})
		})
	)

	const aggregates = results.reduce(
		(aggrs, res) => {
			aggrs[res.for][res.timeframe] = res
			return aggrs
		},
		{
			publisher: {},
			advertiser: {},
		}
	)

	return { aggregates }
}

export async function getAllChannelsForIdentity({ address }) {
	const allActive = await getAllChannels()
	const withBalance = await getAllChannelsWhereHasBalance(allActive, address)

	return withBalance
}

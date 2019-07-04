import { getEthers } from 'services/smart-contracts/ethers'
import { constants } from 'adex-models'
import { utils, Contract } from 'ethers'
import { getAllCampaigns } from 'services/adex-market/actions'
import { lastApprovedState, eventsAggregates } from 'services/adex-validator/actions'
import { bigNumberify } from 'ethers/utils'
import { Channel, MerkleTree } from 'adex-protocol-eth/js'

const { formatEther, formatUnits } = utils
const privilegesNames = constants.valueToKey(constants.IdentityPrivilegeLevel)

export async function getAddressBalances({ address, authType }) {
	const {
		provider,
		Dai
	} = await getEthers(authType)

	const calls = [
		provider.getBalance(address.address),
		Dai.balanceOf(address.address)
	]

	const balances = await Promise.all(calls)
	const formatted = {
		address: address.address,
		path: address.serializedPath || address.path, // we are going to keep the entire path
		balanceEth: balances[0].toString(),
		balanceDai: balances[1].toString()
	}

	return formatted
}

export async function getAccountStats({ account }) {
	const { wallet, identity } = account
	const {
		provider,
		Dai,
		Identity
	} = await getEthers(wallet.authType)

	const { status = {} } = identity
	const identityContract = new Contract(identity.address, Identity.abi, provider)
	let privilegesAction
	try {
		await identityContract.deployed()
		privilegesAction = identityContract.privileges(wallet.address)
	} catch {
		privilegesAction = status.type || 'Not Deployed'
	}

	const calls = [
		provider.getBalance(wallet.address),
		Dai.balanceOf(wallet.address),
		Dai.balanceOf(identity.address),
		privilegesAction,
		getValidatorData({ wallet, identity })
	]

	const [
		walletBalanceEth,
		walletBalanceDai,
		identityBalanceDai,
		walletPrivileges,
		validatorsData
	]
		= await Promise.all(calls.map(c =>
			c
				.then(res => res)
				.catch(e => { return {} })
		))

	const { outstandingBalanceDai = 0, aggregates = [] } = validatorsData

	// BigNumber values for balances
	const raw = {
		walletBalanceEth,
		walletBalanceDai,
		identityBalanceDai,
		walletPrivileges,
		outstandingBalanceDai,
		totalIdentityBalanceDai: identityBalanceDai.add(outstandingBalanceDai),
		aggregates
	}

	// console.log('raw', raw)

	const formatted = {
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivilege: privilegesNames[walletPrivileges],
		walletBalanceEth: formatEther(walletBalanceEth),
		walletBalanceDai: formatUnits(walletBalanceDai, 18),
		identityAddress: identity.address,
		identityBalanceDai: formatUnits(identityBalanceDai, 18),
		outstandingBalanceDai: formatUnits(outstandingBalanceDai, 18),
		totalIdentityBalanceDai: formatUnits(raw.totalIdentityBalanceDai, 18),
		aggregates
	}

	return {
		raw,
		formatted
	}
}

async function getAllChannels() {
	const channels = await getAllCampaigns(true)
	return Promise.all(channels.map(async channel => {
		const { lastApproved } = await lastApprovedState({ campaign: channel })

		if (lastApproved) {
			const balancesTree = lastApproved.newState.msg.balances
			const allLeafs = Object.keys(balancesTree).map(k => Channel.getBalanceLeaf(k, balancesTree[k]))
			const mTree = new MerkleTree(allLeafs)
			return { lastApproved, mTree, channel }
		} else {
			return { lastApproved: null, mTree: null, channel }
		}
	}))
}

async function getAllChannelsWhereHasBalance(allActive, addr) {
	return allActive
		.filter(({ lastApproved }) => lastApproved && !!lastApproved.newState.msg.balances[addr])
		.map(({ channel, lastApproved }) => ({ channel, balance: lastApproved.newState.msg.balances[addr] }))
}

async function getOutstandingBalance({ wallet, address, withBalance }) {
	const { authType } = wallet
	const { AdExCore } = await getEthers(authType)

	const withOutstanding = await Promise.all(withBalance.map(async ({ channel, balance }) => {
		const outstanding = bigNumberify(balance).sub(await AdExCore.withdrawnPerUser(channel.id, address))
		return { channel, outstanding }
	}))

	const totalOutstanding = withOutstanding.reduce((sum, ch) => {
		const currentSum = sum.add(ch.outstanding)
		return currentSum
	}, bigNumberify('0'))

	return totalOutstanding || bigNumberify('0')
}

async function getIdentityStatistics({ withBalance, address }) {
	const allCalls = withBalance.map(async ({ channel }) => {
		const agrArgs = `${address}?timeframe=hour`
		const stats = await eventsAggregates({ agrArgs, campaign: channel })
		return stats
	})

	const aggregates = await Promise.all(allCalls.map(ag =>
		ag
			.then(res => res)
			.catch(e => { return {} })
	))
	return aggregates
}

async function getAllChannelsForIdentity({ address }) {
	const allActive = await getAllChannels()
	const withBalance = await getAllChannelsWhereHasBalance(allActive, address)

	return withBalance
}

async function getValidatorData({ wallet, identity }) {
	const { address } = identity
	const withBalance = await getAllChannelsForIdentity({ address })
	const outstandingBalanceDai = await getOutstandingBalance({ wallet, address, withBalance })
	const aggregates = await getIdentityStatistics({ withBalance, address })

	return {
		outstandingBalanceDai,
		aggregates
	}
}

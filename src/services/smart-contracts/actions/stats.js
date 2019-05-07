import { getEthers } from 'services/smart-contracts/ethers'
import { constants } from 'adex-models'
import { utils, Contract } from 'ethers'
import { getAllCampaigns } from 'services/adex-market/actions'
import { lastApprovedState } from 'services/adex-validator/actions'
import { bigNumberify } from 'ethers/utils'
import { Channel, MerkleTree }  from 'adex-protocol-eth/js'

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
		getOutstandingBalance({wallet})
	]

	const [
		walletBalanceEth,
		walletBalanceDai,
		identityBalanceDai,
		walletPrivileges,
		outstandingBalanceDai
	]
		= await Promise.all(calls)

	// BigNumber values for balances
	const raw = {
		walletBalanceEth,
		walletBalanceDai,
		identityBalanceDai,
		walletPrivileges,
		outstandingBalanceDai,
		totalIdentityBalanceDai: identityBalanceDai.add(outstandingBalanceDai)
	}

	const formatted = {
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivilege: privilegesNames[walletPrivileges],
		walletBalanceEth: formatEther(walletBalanceEth),
		walletBalanceDai: formatUnits(walletBalanceDai, 18),
		identityAddress: identity.address,
		identityBalanceDai:  formatUnits(identityBalanceDai, 18),
		outstandingBalanceDai: formatUnits(identityBalanceDai, 18),
		totalIdentityBalanceDai: formatUnits(raw.totalIdentityBalanceDai, 18)
	}

	return {
		raw,
		formatted
	}
}

async function getAllChannels () {
	const channels = await getAllCampaigns()
	return Promise.all(channels.map(async channel => {
		const { lastApproved } = await lastApprovedState({campaign: channel})
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

async function getAllChannelsWhereHasBalance (allActive, addr) {
	return allActive
		.filter(({ lastApproved }) => lastApproved && !!lastApproved.newState.msg.balances[addr])
		.map(({ channel, lastApproved }) => ({ channel, balance: lastApproved.newState.msg.balances[addr] }))
}
async function getOutstandingBalance({wallet}) {
	const {address, authType} = wallet
	const {AdExCore} = await getEthers(authType)
	const allActive = await getAllChannels()
	const withBalance = await getAllChannelsWhereHasBalance(allActive, address)
    
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
import { getEthers } from 'services/smart-contracts/ethers'
import { constants } from 'adex-models'
import { utils, Contract } from 'ethers'
import { getAllCampaigns } from 'services/adex-market/actions'
import {
	lastApprovedState,
	getValidatorAuthToken,
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
			const { lastApprovedBalances } = channel.status || {}

			if (lastApprovedBalances) {
				const allLeafs = Object.entries(lastApprovedBalances).map(([k, v]) =>
					Channel.getBalanceLeaf(k, v)
				)
				const mTree = new MerkleTree(allLeafs)
				return { lastApprovedBalances, mTree, channel }
			} else {
				return { lastApprovedBalances: null, mTree: null, channel }
			}
		})
	)
}

async function getAllChannelsWhereHasBalance(allActive, addr) {
	return allActive
		.filter(
			({ lastApprovedBalances }) =>
				lastApprovedBalances && !!lastApprovedBalances[addr]
		)
		.map(({ channel, lastApprovedBalances }) => ({
			channel,
			balance: lastApprovedBalances[addr],
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

export async function getAllChannelsForIdentity({ address }) {
	const allActive = await getAllChannels()
	const withBalance = await getAllChannelsWhereHasBalance(allActive, address)

	return withBalance
}

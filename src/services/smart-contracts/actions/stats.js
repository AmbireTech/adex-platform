import { getEthers } from 'services/smart-contracts/ethers'
import { constants } from 'adex-models'
import { Contract } from 'ethers'
import { getValidatorAuthToken } from 'services/adex-validator/actions'
import { bigNumberify, formatEther, formatUnits } from 'ethers/utils'
import { formatTokenAmount } from 'helpers/formatters'
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
	outstandingBalanceDai = {
		total: bigNumberify('0'),
		available: bigNumberify('0'),
	},
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
		identityBalanceDai = bigNumberify('0'),
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
		outstandingBalanceDai: outstandingBalanceDai.available,
		totalOutstandingBalanceDai: outstandingBalanceDai.total,
		availableIdentityBalanceDai: identityBalanceDai.add(
			outstandingBalanceDai.available
		),
		totalIdentityBalanceDai: identityBalanceDai.add(
			outstandingBalanceDai.total
		),
	}

	const formatted = {
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivileges: privilegesNames[walletPrivileges],
		walletBalanceEth: formatEther(walletBalanceEth),
		walletBalanceDai: formatTokenAmount(walletBalanceDai, 18, false, 2),
		identityAddress: identity.address,
		identityBalanceDai: formatTokenAmount(identityBalanceDai, 18, false, 2),
		outstandingBalanceDai: formatTokenAmount(
			raw.outstandingBalanceDai,
			18,
			false,
			2
		),
		totalOutstandingBalanceDai: formatTokenAmount(
			raw.totalOutstandingBalanceDai,
			18,
			false,
			2
		),
		availableIdentityBalanceDai: formatTokenAmount(
			raw.availableIdentityBalanceDai,
			18,
			false,
			2
		),
		totalIdentityBalanceDai: formatTokenAmount(
			raw.totalIdentityBalanceDai,
			18,
			false,
			2
		),
	}

	return {
		raw,
		formatted,
	}
}

export async function getOutstandingBalance({ wallet, address, withBalance }) {
	// const sweepMin = minToSweep()
	const bigZero = bigNumberify(0)

	const initial = { total: bigZero, available: bigZero }

	const allOutstanding = withBalance.reduce((amounts, ch) => {
		const { outstanding, outstandingAvailable } = ch
		const current = { ...amounts }
		current.total = current.total.add(outstanding)
		current.available = current.available.add(outstandingAvailable)

		return current
	}, initial)

	return allOutstanding
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

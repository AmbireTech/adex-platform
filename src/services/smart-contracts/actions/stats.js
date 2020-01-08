import { getEthers } from 'services/smart-contracts/ethers'
import { constants } from 'adex-models'
import { getValidatorAuthToken } from 'services/adex-validator/actions'
import { bigNumberify, formatUnits, parseUnits } from 'ethers/utils'
import { formatTokenAmount } from 'helpers/formatters'
import { selectRelayerConfig, selectMainToken } from 'selectors'

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

const getWithdrawTokensBalances = async ({ getToken, address }) => {
	const { routineWithdrawTokens } = selectRelayerConfig()
	const balancesCalls = routineWithdrawTokens.map(async token => {
		const tokenContract = getToken(token)

		const balance = await tokenContract.balanceOf(address)
		const balanceUSD = await valueInUSD({ token, balance })
		const balanceMainToken = await usdToMainTokenBalance({ balanceUSD })

		return { token, balance, balanceUSD, balanceMainToken }
	})

	return Promise.all(balancesCalls)
}

export async function getAccountStats({
	account,
	outstandingBalanceDai = {
		total: bigNumberify('0'),
		available: bigNumberify('0'),
	},
}) {
	const { wallet, identity } = account
	const { address } = identity
	const { getIdentity, getToken } = await getEthers(wallet.authType)

	const { status = {} } = identity
	const identityContract = getIdentity({ address })
	let privilegesAction
	try {
		await identityContract.deployed()
		privilegesAction = identityContract.privileges(wallet.address)
	} catch {
		privilegesAction = Promise.resolve(status.type || 'Not Deployed')
	}

	const calls = [
		getWithdrawTokensBalances({ getToken, address }),
		privilegesAction,
	]

	const [
		identityWithdrawTokensBalancesBalances = [],
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

	const {
		identityBalanceUsd,
		identityBalanceMainToken,
	} = identityWithdrawTokensBalancesBalances.reduce(
		(balances, t) => {
			balances.identityBalanceUsd += t.balanceUSD
			balances.identityBalanceMainToken = balances.identityBalanceMainToken.add(
				t.balanceMainToken
			)

			return balances
		},
		{
			identityBalanceUsd: 0,
			identityBalanceMainToken: bigNumberify(0),
		}
	)

	// BigNumber values for balances
	const raw = {
		identityWithdrawTokensBalancesBalances,
		walletPrivileges,
		identityBalanceUsd,
		identityBalanceMainToken,
		outstandingBalanceDai: outstandingBalanceDai.available,
		totalOutstandingBalanceDai: outstandingBalanceDai.total,
		availableIdentityBalanceDai: identityBalanceMainToken.add(
			outstandingBalanceDai.available
		),
		totalIdentityBalanceDai: identityBalanceMainToken.add(
			outstandingBalanceDai.total
		),
	}

	const formatted = {
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivileges: privilegesNames[walletPrivileges],
		identityAddress: identity.address,
		identityBalanceDai: formatTokenAmount(
			identityBalanceMainToken,
			18,
			false,
			2
		),
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

const usdPriceMapping = {
	// SAI
	'0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': [1.0],
	// DAI
	'0x6b175474e89094c44da98b954eedeac495271d0f': [1.0],
}

async function valueInUSD({ token, balance }) {
	const { address, decimals } = token
	const [price, mappingDecimals = decimals] = usdPriceMapping[
		address.toLowerCase()
	] || [1.0, 18]

	const balanceInUSD = bigNumberify(balance)
		.mul(bigNumberify(price))
		.toString()

	return parseFloat(formatUnits(balanceInUSD, mappingDecimals))
}

async function usdToMainTokenBalance({ balanceUSD }) {
	const { address, decimals } = selectMainToken()

	const [price, mappingDecimals = decimals] = usdPriceMapping[
		address.toLowerCase()
	] || [1.0, 18]

	const balanceInMainToken = (balanceUSD * price).toString()

	return parseUnits(balanceInMainToken, mappingDecimals)
}

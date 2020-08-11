import { getEthers } from 'services/smart-contracts/ethers'
import { constants } from 'adex-models'
import { getValidatorAuthToken } from 'services/adex-validator/actions'
import { bigNumberify, formatEther } from 'ethers/utils'
import { formatTokenAmount } from 'helpers/formatters'
import {
	selectRelayerConfig,
	selectMainToken,
	selectRoutineWithdrawTokens,
	selectFeeTokenWhitelist,
} from 'selectors'

const privilegesNames = constants.valueToKey(constants.IdentityPrivilegeLevel)

const tokenAvailableBalance = ({ token, balance, mainToken }) => {
	if (token.address === mainToken.address) {
		return balance
	}

	const feeToken = selectFeeTokenWhitelist()[token.address]

	// approve + swap txns
	const swapFees = bigNumberify(feeToken.min).mul(bigNumberify(2))

	const isAvailable = swapFees.mul(bigNumberify(2)).lte(balance)
	return isAvailable ? balance : bigNumberify(0)
}

export const getTotalAccountRevenue = async ({ all }) => {
	const withdrawTokens = selectRoutineWithdrawTokens()
	const totalRevenue = await Object.values(all).reduce(
		async (revenuePr, { balance, depositAsset } = {}) => {
			const revenue = await revenuePr

			const token = withdrawTokens[depositAsset]

			// const hasMinBalance = bigNumberify(balance).gt(
			// 	bigNumberify(token.minFinal)
			// )

			// NOTE: Show everything
			const hasMinBalance = bigNumberify(balance).gt(bigNumberify(0))

			const balanceMainToken = hasMinBalance
				? await tokenInMainTokenValue({
						token,
						balance,
				  })
				: bigNumberify(0)

			return revenue.add(balanceMainToken)
		},
		Promise.resolve(bigNumberify(0))
	)

	return totalRevenue
}

export const getWithdrawTokensBalances = async ({
	authType,
	address,
	getFullBalances,
}) => {
	const { getToken } = await getEthers(authType)
	const { routineWithdrawTokens, mainToken } = selectRelayerConfig()
	const balancesCalls = routineWithdrawTokens.map(async token => {
		const tokenContract = getToken(token)

		const balance = await tokenContract.balanceOf(address)

		const available = getFullBalances
			? balance
			: tokenAvailableBalance({
					token,
					mainToken,
					balance,
			  })

		const balanceMainToken = await tokenInMainTokenValue({
			token,
			balance: available,
		})

		return { token, balance: available, balanceMainToken }
	})

	const balances = await Promise.all(balancesCalls)
	const { totalBalanceInMainToken, mainTokenBalance } = balances.reduce(
		(data, balanceData) => {
			data.totalBalanceInMainToken = data.totalBalanceInMainToken.add(
				balanceData.balanceMainToken
			)

			if (balanceData.token.address === mainToken.address) {
				data.mainTokenBalance = balanceData.balance
			}

			return data
		},
		{
			totalBalanceInMainToken: bigNumberify(0),
			mainTokenBalance: bigNumberify(0),
		}
	)

	return {
		balances,
		mainTokenBalance,
		totalBalanceInMainToken,
	}
}

export async function getAddressBalances({
	address,
	authType,
	getFullBalances,
}) {
	const { provider } = await getEthers(authType)

	const calls = [
		provider.getBalance(address.address),
		getWithdrawTokensBalances({
			authType,
			address: address.address,
			getFullBalances,
		}),
	]

	const balances = await Promise.all(calls)
	const formatted = {
		address: address.address,
		path: address.serializedPath || address.path, // we are going to keep the entire path
		balanceEth: formatEther(balances[0].toString()),
		tokensBalances: balances[1].balances.map(({ token, balance }) => {
			return {
				balance: formatTokenAmount(balance, token.decimals, false, 2),
				symbol: token.symbol,
			}
		}),
	}

	return formatted
}

export async function getAccountStats({
	account,
	outstandingBalanceMainToken = {
		total: bigNumberify('0'),
		available: bigNumberify('0'),
	},
	all,
}) {
	const { wallet, identity } = account
	const { authType } = wallet
	const { address } = identity
	const { getIdentity } = await getEthers(authType)
	const { decimals } = selectMainToken()

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
		getWithdrawTokensBalances({ authType, address }),
		privilegesAction,
		getTotalAccountRevenue({ all }),
	]

	const [
		identityWithdrawTokensBalancesBalances = {},
		walletPrivileges,
		totalRevenue,
	] = await Promise.all(
		calls.map(c =>
			c
				.then(res => res)
				.catch(e => {
					return undefined
				})
		)
	)

	const identityBalanceMainToken =
		identityWithdrawTokensBalancesBalances.totalBalanceInMainToken ||
		bigNumberify(0)

	// BigNumber values for balances
	const raw = {
		identityWithdrawTokensBalancesBalances,
		walletPrivileges,
		identityBalanceMainToken,
		outstandingBalanceMainToken: outstandingBalanceMainToken.available,
		totalOutstandingBalanceMainToken: outstandingBalanceMainToken.total,
		availableIdentityBalanceMainToken: identityBalanceMainToken.add(
			outstandingBalanceMainToken.available
		),
		totalIdentityBalanceMainToken: identityBalanceMainToken.add(
			outstandingBalanceMainToken.total
		),
		totalRevenue,
	}

	const formatted = {
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivileges: privilegesNames[walletPrivileges],
		identityAddress: identity.address,
		identityBalanceMainToken: formatTokenAmount(
			identityBalanceMainToken,
			decimals,
			false,
			2
		),
		outstandingBalanceMainToken: formatTokenAmount(
			raw.outstandingBalanceMainToken,
			decimals,
			false,
			2
		),
		totalOutstandingBalanceMainToken: formatTokenAmount(
			raw.totalOutstandingBalanceMainToken,
			decimals,
			false,
			2
		),
		availableIdentityBalanceMainToken: formatTokenAmount(
			raw.availableIdentityBalanceMainToken,
			decimals,
			false,
			2
		),
		totalIdentityBalanceMainToken: formatTokenAmount(
			raw.totalIdentityBalanceMainToken,
			decimals,
			false,
			2
		),
		totalRevenue: formatTokenAmount(
			raw.totalRevenue || '0',
			decimals,
			false,
			2
		),
	}

	return {
		raw,
		formatted,
	}
}

// NOTE: currently working because DAI and SAI has the same price and decimals
// We should use getOutstandingBalanceMainToken if changed
export async function getOutstandingBalance({ withBalance }) {
	const bigZero = bigNumberify(0)

	const initial = { total: bigZero, available: bigZero }

	const allOutstanding = withBalance.reduce((amounts, ch) => {
		const { outstanding, outstandingAvailable } = ch
		const current = { ...amounts }
		current.total = current.total.add(outstanding)
		current.available = current.available.add(
			bigNumberify(outstandingAvailable)
		)

		return current
	}, initial)

	return allOutstanding
}

export async function getOutstandingBalanceMainToken({ withBalance }) {
	const tokens = selectRoutineWithdrawTokens()
	const bigZero = bigNumberify(0)

	const initial = { total: bigZero, available: bigZero }

	const allOutstanding = withBalance.reduce((amounts, ch) => {
		const { outstanding, outstandingAvailable, channel } = ch
		const { depositAsset } = channel
		const token = tokens[depositAsset]

		const outstandingMT = tokenInMainTokenValue({ token, balance: outstanding })
		const outstandingAvailableMT = tokenInMainTokenValue({
			token,
			balance: outstandingAvailable,
		})

		const current = { ...amounts }
		current.total = current.total.add(outstandingMT)
		current.available = current.available.add(outstandingAvailableMT)

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

const saiDaiConversion = async ({ token, balance }) => balance

const valueInMainTokenConversions = {
	// SAI
	'0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': {
		// DAI
		'0x6b175474e89094c44da98b954eedeac495271d0f': saiDaiConversion,
	},
	// DAI
	'0x6b175474e89094c44da98b954eedeac495271d0f': {
		// SAI
		'0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359': saiDaiConversion,
	},
}

export async function tokenInMainTokenValue({ token, balance }) {
	const { address } = selectMainToken()

	if (address === token.address) {
		return balance
	}

	const valueInMainToken = await valueInMainTokenConversions[
		address.toLowerCase()
	][token.address.toLowerCase()]({
		token,
		balance,
	})

	return valueInMainToken
}

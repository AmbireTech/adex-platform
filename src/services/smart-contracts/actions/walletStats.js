import { getEthers } from 'services/smart-contracts/ethers'
import { BigNumber } from 'ethers'
import { formatTokenAmount } from 'helpers/formatters'
import { selectMainToken } from 'selectors'
import { AUTH_TYPES } from 'constants/misc'
import { privilegesNames, getWithdrawTokensBalances } from './stats'

export async function getAccountStatsWallet({ account }) {
	const { wallet, identity } = account
	const { address } = identity
	const { getIdentity } = await getEthers(AUTH_TYPES.READONLY)
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

	const calls = [getWithdrawTokensBalances({ address }), privilegesAction]

	const [
		identityWithdrawTokensBalancesBalances = {},
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

	const identityBalanceMainToken =
		identityWithdrawTokensBalancesBalances.totalBalanceInMainToken ||
		BigNumber.from(0)

	// BigNumber values for balances
	const raw = {
		identityWithdrawTokensBalancesBalances,
		walletPrivileges,
		identityBalanceMainToken,
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
	}

	return {
		raw,
		formatted,
	}
}

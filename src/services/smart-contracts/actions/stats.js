import { getEthers } from 'services/smart-contracts/ethers'
import { constants } from 'adex-models'
import { utils, Contract } from 'ethers'
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
	const formated = {
		address: address.address,
		path: address.serializedPath || address.path, // we are going to keep the entire path
		balanceEth: balances[0].toString(),
		balanceDai: balances[1].toString()
	}

	return formated
}

export async function getAccountStats({ account }) {
	const { wallet, identity } = account
	const {
		provider,
		Dai,
		Identity
	} = await getEthers(wallet.authType)

	const identityContract = new Contract(identity.address, Identity.abi, provider)

	const calls = [
		provider.getBalance(wallet.address),
		Dai.balanceOf(wallet.address),
		Dai.balanceOf(identity.address),
		identityContract.privileges(wallet.address)
	]

	const [
		walletBalanceEth,
		walletBalanceDai,
		identityBalanceDai,
		walletPrivileges
	]
		= await Promise.all(calls)

	// BigNumber values for balances
	const raw = {
		walletBalanceEth,
		walletBalanceDai,
		identityBalanceDai,
		walletPrivileges
	}

	const formated = {
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivilege: privilegesNames[walletPrivileges],
		walletBalanceEth: formatEther(walletBalanceEth),
		walletBalanceDai: formatUnits(walletBalanceDai, 18),
		identityAddress: identity.address,
		identityBalanceDai: formatUnits(identityBalanceDai, 18)
	}

	return {
		raw,
		formated
	}
}
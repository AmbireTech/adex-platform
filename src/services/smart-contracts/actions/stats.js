import { getEthers } from 'services/smart-contracts/ethers'

export async function getAddressBalances({ address, authType }) {
	const {
		provider,
		Dai
	} = await getEthers(authType)

	const calls = [
		provider.getBalance(address),
		Dai.balanceOf(address)
	]

	const balances = await Promise.all(calls)
	const formated = {
		address: address,
		walletBalanceEth: balances[0].toString(),
		walletBalanceDai: balances[0].toString()
	}

	return formated
}
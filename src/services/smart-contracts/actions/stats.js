import { utils } from 'ethers'
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
		walletBalanceEth: utils.formatEther(balances[0].toString()),
		walletBalanceDai: utils.formatEther(balances[0].toString())

	}
	
	return formated
}
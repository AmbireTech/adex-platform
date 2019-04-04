import { getEthers } from 'services/smart-contracts/ethers'

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
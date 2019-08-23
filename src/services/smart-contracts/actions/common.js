import { getEthers } from 'services/smart-contracts/ethers'

export const isConnectionLost = async authType => {
	try {
		// When we remove Metamask
		// if in 5 sec doesn't connect will
		// return that connection is lost
		const eth = await Promise.race([
			getEthers(authType),
			new Promise((resolve, reject) => {
				setTimeout(() => {
					reject('Timed out')
				}, 5000)
			}),
		])
		await eth.provider.getBlockNumber()
		return false
	} catch (error) {
		return true
	}
}

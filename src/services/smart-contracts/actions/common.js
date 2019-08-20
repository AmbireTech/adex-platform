import { getEthers } from 'services/smart-contracts/ethers';

export const isConnectionLost = async () => {
	try {
		const eth = await getEthers()
		await eth.provider.getBlockNumber()
		return false
	} catch (error) {
		return true
	}
}
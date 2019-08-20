import { getEthers } from 'services/smart-contracts/ethers';
import { AUTH_TYPES } from 'constants/misc'

export const isConnectionLost = async () => {
	try {
		const eth = await getEthers(AUTH_TYPES.METAMASK.name)
		await eth.provider.getBlockNumber()
		return false
	} catch (error) {
		return true
	}
}
import { getEthers } from 'services/smart-contracts/ethers'
import { utils } from 'ethers'
import { AUTH_TYPES } from 'constants/misc'

export const getGasPrice = async (format = 'wei') => {
	const { provider } = await getEthers(AUTH_TYPES.READONLY)
	const gasPrice = await provider.getGasPrice()
	return utils.formatUnits(gasPrice.toNumber(), format)
}

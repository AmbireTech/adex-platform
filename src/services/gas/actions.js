import { getEthers } from 'services/smart-contracts/ethers'
import { formatUnits } from 'ethers/utils'
import { AUTH_TYPES } from 'constants/misc'

export const getGasPrice = async (format = 'wei') => {
	const { provider } = await getEthers(AUTH_TYPES.READONLY)
	const gasPrice = await provider.getGasPrice()
	return formatUnits(gasPrice.toNumber(), format)
}

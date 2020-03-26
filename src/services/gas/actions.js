import { getEthers } from 'services/smart-contracts/ethers'
import { formatUnits } from 'ethers/utils'

export const getGasPrice = async (authType, format = 'wei') => {
	const { provider } = await getEthers(authType)
	const gasPrice = await provider.getGasPrice()
	return formatUnits(gasPrice.toNumber(), format)
}

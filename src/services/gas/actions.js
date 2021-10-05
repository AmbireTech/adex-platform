import { getEthersReadOnly } from 'services/smart-contracts/ethers'
import { utils } from 'ethers'

export const getGasPrice = async (format = 'wei') => {
	const { provider } = await getEthersReadOnly()
	const gasPrice = await provider.getGasPrice()
	return utils.formatUnits(gasPrice.toNumber(), format)
}

import { ethers, constants } from 'ethers'
import { getEthers } from 'services/smart-contracts/ethers'
import { isEthAddress } from 'helpers/validators'
import ERC20TokenABI from 'services/smart-contracts/abi/ERC20Token'

export const isEthAddressERC20 = async (addr = '', authType) => {
	try {
		if (isEthAddress(addr)) {
			const { provider } = await getEthers(authType)
			const contract = new ethers.Contract(addr, ERC20TokenABI, provider)
			await Promise.all([
				contract.totalSupply(),
				contract.balanceOf(constants.AddressZero),
				contract.allowance(constants.AddressZero, constants.AddressZero),
			])
			return true
		}
		return false
	} catch (error) {
		return false
	}
}

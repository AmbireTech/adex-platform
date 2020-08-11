import { ethers, constants } from 'ethers'
import { getEthers } from 'services/smart-contracts/ethers'
import { isEthAddress } from 'helpers/validators'
import ERC20TokenABI from 'services/smart-contracts/abi/ERC20Token'
import { AUTH_TYPES } from 'constants/misc'

export const isEthAddressERC20 = async (addr = '') => {
	try {
		if (isEthAddress(addr)) {
			const { provider } = await getEthers(AUTH_TYPES.READONLY)
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

export const getERC20Balance = async ({ addr = '', balanceFor = '' }) => {
	try {
		const { provider } = await getEthers(AUTH_TYPES.READONLY)
		const contract = new ethers.Contract(addr, ERC20TokenABI, provider)
		const balance = await contract.balanceOf(balanceFor)

		return balance
	} catch (error) {
		console.error('ERR_GETTING_ERC20_BALANCE')
		return null
	}
}

import { getEthers } from 'services/smart-contracts/ethers'
import { ethers } from 'ethers'

export const getPrivileges = ({ walletAddr, identityAddr, walletAuthType }) => {
	return getEthers(walletAuthType)
		.then(({ provider, Identity }) => {
			const contract = new ethers.Contract(identityAddr, Identity.abi, provider)
			return contract.privileges(walletAddr)
		})
}
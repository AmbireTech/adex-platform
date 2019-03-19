import { cfg, web3Utils, getWeb3 } from 'services/smart-contracts/ADX'
import { AUTH_TYPES } from 'constants/misc'
import { getRsvFromSig, getTypedDataHash } from 'services/smart-contracts/utils'

export const getAccount = ({ privateKey, authType } = {}) => {
	return getWeb3(authType)
		.then(({ web3 }) => {
			if (privateKey) {
				return web3.eth.accounts.privateKeyToAccount(privateKey)
			} else {
				return web3.eth.accounts.create()
			}
		})
}

export const sigDemoMsg = ({ msg = 'demo-sign', account }) => {

	let typedData = [
		{ type: 'uint', name: 'Auth token', value: msg }
	]

	let hash = getTypedDataHash({ typedData: typedData })

	const sig = account.sign(hash)

	return { sig, hash }
}
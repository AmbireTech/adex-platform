// TODO: ethers
export const getAccount = ({ privateKey, authType } = {}) => {
	// return getWeb3(authType)
	// 	.then(({ web3 }) => {
	// 		if (privateKey) {
	// 			return web3.eth.accounts.privateKeyToAccount(privateKey)
	// 		} else {
	// 			return web3.eth.accounts.create()
	// 		}
	// 	})
}

export const sigDemoMsg = ({ msg = 'demo-sign', account }) => {

	let typedData = [
		{ type: 'uint', name: 'Auth token', value: msg }
	]

	let hash = ''// getTypedDataHash({ typedData: typedData })

	const sig = account.sign(hash)

	return { sig, hash }
}
import { ethers } from 'ethers'
import { contracts } from './contractsCfg'
import { AUTH_TYPES } from 'constants/misc'

const { AdExCore, Identity, DAI, IdentityFactory } = contracts

const localWeb3 = () => {
	const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_NODE_ADDR)
	const adexCore = new ethers.Contract(AdExCore.address, AdExCore.abi, provider)
	const dai = new ethers.Contract(DAI.address, DAI.abi, provider)
	const identityFactory = new ethers.Contract(IdentityFactory.abi, provider)

	const results = {
		provider: provider,
		AdExCore: adexCore,
		Identity: Identity,
		Dai: dai,
		IdentityFactory: identityFactory
	}

	return results
}

// TODO: GET get injected web3 on user action
const getInjectedWeb3 = new Promise(function (resolve, reject) {
	// Wait for loading completion to avoid race conditions with web3 injection timing.
	window.addEventListener('load', function () {
		console.log('getInjectedWeb3')
		const ethereum = window.ethereum
		let provider = null
		// let mode = null // metamask, and as some point trezor, ledger, ...
		let adexCore = null
		let dai = null
		let identityFactory = null

		if (ethereum) {
			provider = new ethers.providers.Web3Provider(ethereum)
			adexCore = new ethers.Contract(AdExCore.address, AdExCore.abi, provider)
			dai = new ethers.Contract(DAI.address, DAI.abi, provider)
			identityFactory = new ethers.Contract(IdentityFactory.abi, provider)

			ethereum.enable()
				.then(() => {
					console.log('Injected web3 detected.')
					const results = {
						provider: provider,
						AdExCore: adexCore,
						Identity: Identity,
						Dai: dai,
						IdentityFactory: identityFactory
					}

					resolve(results)
				})
				.catch(err => {
					reject('User denied account access...')
				})
		}
		// Legacy dapp browsers...
		else if (window.web3) {
			provider = new ethers.providers.Web3Provider(window.web3.currentProvider)
			adexCore = new ethers.Contract(AdExCore.address, AdExCore.abi, provider)
			dai = new ethers.Contract(DAI.address, DAI.abi, provider)
			identityFactory = new ethers.Contract(IdentityFactory.abi, provider)

			console.log('Injected legacy web3 detected.')
			const results = {
				provider: provider,
				AdExCore: adexCore,
				Identity: Identity,
				Dai: dai,
				IdentityFactory: identityFactory
			}

			resolve(results)
		} else {
			console.log('Non-Ethereum browser detected.');
			reject('Non-Ethereum browser detected.');
		}
	})
})

const getLocalWeb3 = new Promise(function (resolve, reject) {
	console.log('getLocalWeb3')
	resolve(localWeb3())
})

const getEthers = (mode) => {
	/* NOTE: use Promise wrapper because despite getWeb3 is Promise itself it is not called by user action
	*   and this results in Trezor popup block by the browser
	*/
	return new Promise((resolve, reject) => {
		if (mode === AUTH_TYPES.METAMASK.name) {
			return resolve(getInjectedWeb3)
		} else {
			return resolve(getLocalWeb3)
		}
	})
}

export {
	getEthers
}
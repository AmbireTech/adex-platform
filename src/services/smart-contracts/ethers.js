import { ethers } from 'ethers'
import { contracts } from './contractsCfg'
import { AUTH_TYPES } from 'constants/misc'

const { AdExCore, Identity, DAI, IdentityFactory } = contracts
const localWeb3 = async () => {
	const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_NODE_ADDR)
	const adexCore = new ethers.Contract(AdExCore.address, AdExCore.abi, provider)
	const dai = new ethers.Contract(DAI.address, DAI.abi, provider)
	const identityFactory = new ethers.Contract(
		IdentityFactory.address,
		IdentityFactory.abi,
		provider)

	const results = {
		provider: provider,
		AdExCore: adexCore,
		Identity: Identity,
		Dai: dai,
		IdentityFactory: identityFactory
	}

	return results
}

const loadInjectedWeb3 = new Promise((resolve, reject) => {
	window.addEventListener('load', () => {
		const ethereum = window.ethereum
		const web3 = window.web3
		return resolve({
			ethereum,
			web3
		})
	})
})

const getInjectedWeb3 = async () => {
	const { web3, ethereum } = await loadInjectedWeb3.then()
	let provider = null
	// let mode = null // metamask, and as some point trezor, ledger, ...
	let adexCore = null
	let dai = null
	let identityFactory = null

	if (ethereum) {
		try {
			const enabled = await ethereum.enable()
			console.log('Injected ethereum detected.', enabled)

			provider = new ethers.providers.Web3Provider(ethereum)
			adexCore = new ethers.Contract(AdExCore.address, AdExCore.abi, provider)
			dai = new ethers.Contract(DAI.address, DAI.abi, provider)
			identityFactory = new ethers.Contract(
				IdentityFactory.address,
				IdentityFactory.abi,
				provider)
			const results = {
				provider: provider,
				AdExCore: adexCore,
				Identity: Identity,
				Dai: dai,
				IdentityFactory: identityFactory
			}

			return results

		} catch (err) {
			console.error(err.message)
			throw new Error(err.message)
		}
	}
	// Legacy dapp browsers...
	else if (web3) {
		provider = new ethers.providers.Web3Provider(window.web3.currentProvider)
		adexCore = new ethers.Contract(AdExCore.address, AdExCore.abi, provider)
		dai = new ethers.Contract(DAI.address, DAI.abi, provider)
		identityFactory = new ethers.Contract(
			IdentityFactory.address,
			IdentityFactory.abi,
			provider)

		console.log('Injected legacy web3 detected.')
		const results = {
			provider: provider,
			AdExCore: adexCore,
			Identity: Identity,
			Dai: dai,
			IdentityFactory: identityFactory
		}

		return results
	} else {
		console.error('Non-Ethereum browser detected.')
		throw new Error('Non-Ethereum browser detected.')
	}
}

const getLocalWeb3 = new Promise(function (resolve, reject) {
	console.log('getLocalWeb3')
	resolve(localWeb3())
})

const getEthers = async (mode) => {
	/* NOTE: use Promise wrapper because despite getWeb3 is Promise itself it is not called by user action
	*   and this results in Trezor popup block by the browser
	*/
	if (mode === AUTH_TYPES.METAMASK.name) {
		const injected = await getInjectedWeb3()
		return injected
	} else {
		return getLocalWeb3
	}
}

export {
	getEthers
}
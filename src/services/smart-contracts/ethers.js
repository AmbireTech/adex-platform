import { ethers, utils } from 'ethers'
import { contracts } from './contractsCfg'
import { AUTH_TYPES } from 'constants/misc'

const { AdExCore, Identity, DAI, IdentityFactory } = contracts
const localWeb3 = async () => {
	const provider = new ethers.providers.JsonRpcProvider(
		process.env.WEB3_NODE_ADDR
	)
	const adexCore = new ethers.Contract(AdExCore.address, AdExCore.abi, provider)
	const dai = new ethers.Contract(DAI.address, DAI.abi, provider)
	const identityFactory = new ethers.Contract(
		IdentityFactory.address,
		IdentityFactory.abi,
		provider
	)

	const results = {
		provider: provider,
		AdExCore: adexCore,
		Identity: Identity,
		Dai: dai,
		IdentityFactory: identityFactory,
	}

	return results
}

const loadInjectedWeb3 = new Promise((resolve, reject) => {
	window.addEventListener('load', () => {
		const ethereum = window.ethereum
		const web3 = window.web3
		return resolve({
			ethereum,
			web3,
		})
	})
})

const injectedWeb3 = async () => {
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
				provider
			)
			const results = {
				provider: provider,
				AdExCore: adexCore,
				Identity: Identity,
				Dai: dai,
				IdentityFactory: identityFactory,
			}

			return results
		} catch (err) {
			console.error('Err getting injected ethereum.', err)
			throw new Error(err.message)
		}
	}
	// Legacy dapp browsers...
	// TODO: we just have to throw or show notification
	// At the moment if it throws it will show error toast but not always.
	else if (web3) {
		console.error('Legacy web3 browser detected. It is not supported!')
		console.error('Fallback to local web3 provider')
		return await localWeb3()
	} else {
		console.error('Non-Ethereum browser detected.')
		console.error('Fallback to local web3 provider')
		return await localWeb3()
	}
}

const getInjectedWeb3 = new Promise((resolve, reject) => {
	return resolve(injectedWeb3())
})

const getLocalWeb3 = new Promise(function(resolve, reject) {
	console.log('getLocalWeb3')
	resolve(localWeb3())
})

const getEthers = mode => {
	/* NOTE: use Promise wrapper because despite getWeb3 is Promise itself it is not called by user action
	 *   and this results in Trezor popup block by the browser
	 */
	if (mode === AUTH_TYPES.METAMASK.name) {
		return getInjectedWeb3
	} else {
		return getLocalWeb3
	}
}

const ethereumSelectedAddress = async () => {
	const { ethereum } = await loadInjectedWeb3.then()
	if (ethereum && ethereum.selectedAddress) {
		return utils.getAddress(ethereum.selectedAddress)
	} else {
		return null
	}
}

const ethereumNetworkId = async () => {
	const { ethereum } = await loadInjectedWeb3.then()
	if (ethereum) {
		const id = parseInt(ethereum.networkVersion, 10)
		return id
	} else {
		return null
	}
}

const getEthereumProvider = async () => {
	const { ethereum } = await loadInjectedWeb3.then()
	if (!ethereum) {
		return null
	}

	if (ethereum.isMetaMask) {
		return AUTH_TYPES.METAMASK.name
	}

	return null
}

export {
	getEthers,
	ethereumSelectedAddress,
	ethereumNetworkId,
	getEthereumProvider,
}

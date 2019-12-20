import { ethers, utils } from 'ethers'
import { contracts } from './contractsCfg'
import { AUTH_TYPES } from 'constants/misc'
import { selectRelayerConfig } from 'selectors'

ethers.errors.setLogLevel('error')

const { AdExCore, Identity, IdentityFactory } = contracts

const getAdexCore = provider => {
	const { coreAddr } = selectRelayerConfig()
	return new ethers.Contract(coreAddr, AdExCore.abi, provider)
}

const getMainToken = provider => {
	const { mainToken = {} } = selectRelayerConfig()
	return new ethers.Contract(
		mainToken.address,
		contracts[mainToken.standard].abi,
		provider
	)
}

const getIdentityFactory = provider => {
	const { identityFactoryAddr } = selectRelayerConfig()
	return new ethers.Contract(identityFactoryAddr, IdentityFactory.abi, provider)
}

const localWeb3 = () => {
	const provider = new ethers.providers.JsonRpcProvider(
		process.env.WEB3_NODE_ADDR
	)
	const adexCore = getAdexCore(provider)
	const dai = getMainToken(provider)
	const identityFactory = getIdentityFactory(provider)

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
	let adexCore = null
	let dai = null
	let identityFactory = null

	if (ethereum) {
		try {
			await ethereum.enable()

			provider = new ethers.providers.Web3Provider(ethereum)
			adexCore = getAdexCore(provider)
			dai = getMainToken(provider)
			identityFactory = getIdentityFactory(provider)
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

const getLocalWeb3 = async () => {
	console.log('getLocalWeb3')
	return localWeb3()
}

const getEthers = mode => {
	/* NOTE: use Promise wrapper because despite getWeb3 is Promise itself it is not called by user action
	 *   and this results in Trezor popup block by the browser
	 */
	if (mode === AUTH_TYPES.METAMASK.name) {
		return injectedWeb3()
	} else {
		return getLocalWeb3()
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

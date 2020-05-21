import { ethers, Contract } from 'ethers'
import { contracts } from './contractsCfg'
import { AUTH_TYPES } from 'constants/misc'
import { selectRelayerConfig } from 'selectors'

ethers.errors.setLogLevel('error')

const { AdExCore, Identity, IdentityFactory } = contracts

const getAdexCore = provider => {
	const { coreAddr } = selectRelayerConfig()
	return new Contract(coreAddr, AdExCore.abi, provider)
}

const getMainToken = provider => {
	const { mainToken = {} } = selectRelayerConfig()
	return new Contract(
		mainToken.address,
		contracts[mainToken.standard].abi,
		provider
	)
}

const getToken = ({ provider, standard, address }) => {
	return new Contract(address, contracts[standard].abi, provider)
}

const getIdentity = ({ provider, address }) => {
	const identityContract = new Contract(address, Identity.abi, provider)

	return identityContract
}

const getIdentityFactory = provider => {
	const { identityFactoryAddr } = selectRelayerConfig()
	return new Contract(identityFactoryAddr, IdentityFactory.abi, provider)
}

const getEthersResult = provider => {
	const adexCore = getAdexCore(provider)
	const mainToken = getMainToken(provider)
	const identityFactory = getIdentityFactory(provider)

	const results = {
		provider,
		AdExCore: adexCore,
		Identity: Identity,
		Dai: mainToken,
		MainToken: mainToken,
		IdentityFactory: identityFactory,
		getToken: ({ standard, address }) =>
			getToken({ provider, standard, address }),
		getIdentity: ({ address }) => getIdentity({ provider, address }),
	}

	return results
}

const localWeb3 = () => {
	const provider = new ethers.providers.JsonRpcProvider(
		process.env.WEB3_NODE_ADDR
	)
	return getEthersResult(provider)
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
	const { web3, ethereum } = await loadInjectedWeb3
	let provider = null

	if (ethereum) {
		try {
			await ethereum.enable()

			provider = new ethers.providers.Web3Provider(ethereum)

			return getEthersResult(provider)
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
	// console.log('getLocalWeb3')
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

const ethereumNetworkId = async () => {
	const { ethereum } = await loadInjectedWeb3
	if (ethereum) {
		const id = parseInt(ethereum.networkVersion, 10)
		return id
	} else {
		return null
	}
}

const getEthereumProvider = async () => {
	const { ethereum } = await loadInjectedWeb3
	if (!ethereum) {
		return null
	}

	if (ethereum.isMetaMask) {
		return AUTH_TYPES.METAMASK.name
	}

	return null
}

const getMetamaskEthereum = async () => {
	const { ethereum } = await loadInjectedWeb3

	if (ethereum && ethereum.isMetaMask) {
		return ethereum
	}

	return null
}

export {
	getEthers,
	ethereumNetworkId,
	getEthereumProvider,
	getMetamaskEthereum,
}

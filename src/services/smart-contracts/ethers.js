import { ethers, Contract } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'
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

const loadInjectedWeb3 = new Promise(async (resolve, reject) => {
	const provider = await detectEthereumProvider()

	if (provider !== window.ethereum) {
		console.error('Do you have multiple wallets installed?')
		reject(new Error('Do you have multiple wallets installed?'))

		// TODO: error or toast
	}

	resolve({
		ethereum: window.ethereum,
	})
})

const getMetamaskSelectedAddress = async () => {
	const { ethereum } = await loadInjectedWeb3

	if (ethereum && ethereum.isMetaMask) {
		try {
			const accounts = await ethereum.request({ method: 'eth_accounts' })
			return accounts[0]
		} catch (err) {
			console.log('(getMetamaskSelectedAddress): Please connect to MetaMask.')
			throw new Error(err)
		}
	}
}

const connectMetaMask = async ethereum => {
	try {
		const selectedAccount = await getMetamaskSelectedAddress()

		if (!selectedAccount) {
			const requestedAddresses = await ethereum.request({
				method: 'eth_requestAccounts',
			})
			// console.log('requestedAddresses', requestedAddresses)
		}
	} catch (err) {
		if (err.code === 4001) {
			// EIP-1193 userRejectedRequest error
			// If this happens, the user rejected the connection request.
			console.log('Please connect to MetaMask.')
		} else {
			console.error(err)
		}
		// TODO: error or toast
	}
}

const injectedWeb3Provider = async () => {
	const { ethereum } = await loadInjectedWeb3

	if (ethereum) {
		try {
			await connectMetaMask(ethereum)

			const provider = new ethers.providers.Web3Provider(ethereum)

			return getEthersResult(provider)
		} catch (err) {
			console.error('Err getting injected ethereum.', err)
			throw new Error(err.message)
		}
	}
}

const getLocalWeb3Provider = async () => {
	// console.log('getLocalWeb3')
	return localWeb3()
}

const getEthers = mode => {
	/* NOTE: use Promise wrapper because despite getWeb3 is Promise itself it is not called by user action
	 *   and this results in Trezor popup block by the browser
	 */
	if (mode === AUTH_TYPES.METAMASK.name) {
		return injectedWeb3Provider()
	} else {
		return getLocalWeb3Provider()
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
	getMetamaskSelectedAddress,
}

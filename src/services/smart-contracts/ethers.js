import { providers, Contract } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'
import { contracts } from './contractsCfg'
import { contractsAddressesByNetwork } from './contractsCfgByNetwork'
import { AUTH_TYPES } from 'constants/misc'
import {
	selectNetwork,
	selectAuthType,
	selectNetworkByChainId,
} from 'selectors'

// ethers.errors.setLogLevel('error')

const {
	// AdExCore,
	Identity,
	IdentityPayable,
	// IdentityFactory,
	WalletZapper,
	UniSwapRouterV2,
	UniSwapRouterV3,
	UniSwapQuoterV3,
} = contracts

function getLocalProvider(rpc) {
	const LocalProvider = rpc.startsWith('wss://')
		? providers.WebSocketProvider
		: providers.JsonRpcProvider

	return new LocalProvider(rpc)
}

// const getAdexCore = provider => {
// 	const { coreAddr } = selectRelayerConfig()
// 	return new Contract(coreAddr, AdExCore.abi, provider)
// }

// const getMainToken = provider => {
// 	const { mainToken = {} } = selectRelayerConfig()
// 	return new Contract(
// 		mainToken.address,
// 		contracts[mainToken.standard].abi,
// 		provider
// 	)
// }

const getToken = ({ provider, standard, address }) => {
	return new Contract(address, contracts[standard].abi, provider)
}

const getIdentity = ({ provider, address }) => {
	const identityContract = new Contract(address, Identity.abi, provider)

	return identityContract
}

const getIdentityPayable = ({ provider, address }) => {
	const identityPayableContract = new Contract(
		address,
		IdentityPayable.abi,
		provider
	)

	return identityPayableContract
}

// const getIdentityFactory = provider => {
// 	const { identityFactoryAddr } = selectRelayerConfig()
// 	return new Contract(identityFactoryAddr, IdentityFactory.abi, provider)
// }

const getWalletZapper = (provider, networkId) => {
	const { walletZapper } = contractsAddressesByNetwork[networkId]
	const walletZapperContract = new Contract(
		walletZapper,
		WalletZapper.abi,
		provider
	)

	return walletZapperContract
}

const getUniRouterV2 = (provider, networkId) => {
	const { swapRouterV2 } = contractsAddressesByNetwork[networkId]

	const uniV2 = swapRouterV2
		? new Contract(swapRouterV2, UniSwapRouterV2.abi, provider)
		: null

	return uniV2
}

const getUniRouterV3 = (provider, networkId) => {
	const { swapRouterV3 } = contractsAddressesByNetwork[networkId]
	const uniV3 = swapRouterV3
		? new Contract(swapRouterV3, UniSwapRouterV3.abi, provider)
		: null

	return uniV3
}

const getUniQuoterV3 = (provider, networkId) => {
	const { quoterV3 } = contractsAddressesByNetwork[networkId]
	const uniQuoterV3 = quoterV3
		? new Contract(quoterV3, UniSwapQuoterV3.abi, provider)
		: null

	return uniQuoterV3
}

const getEthersResult = (provider, networkId) => {
	// const adexCore = getAdexCore(provider)
	// const mainToken = getMainToken(provider)
	// const identityFactory = getIdentityFactory(provider)

	const walletZapper = getWalletZapper(provider, networkId)
	const uniV2 = getUniRouterV2(provider, networkId)
	const uniV3 = getUniRouterV3(provider, networkId)
	const quoterV3 = getUniQuoterV3(provider, networkId)

	const results = {
		provider,
		// AdExCore: adexCore,
		Identity: Identity,
		IdentityPayable: IdentityPayable,
		// Dai: mainToken,
		// MainToken: mainToken,
		// IdentityFactory: identityFactory,
		WalletZapper: walletZapper,
		UniSwapRouterV2: uniV2,
		UniSwapRouterV3: uniV3,
		UniSwapQuoterV3: quoterV3,
		getToken: ({ standard, address }) =>
			getToken({ provider, standard, address }),
		getIdentity: ({ address }) => getIdentity({ provider, address }),
		getIdentityPayable: ({ address }) =>
			getIdentityPayable({ provider, address }),
	}

	return results
}

function isNetworkChanged(currentNetworkUsed) {
	const network = selectNetwork()

	const isChanged =
		JSON.stringify(network) !== JSON.stringify(currentNetworkUsed)
	// JSON.stringify({ id: network.id, ...currentNetworkUsed })

	// const isChanged =
	// 	currentNetworkUsed.id !== network.id ||
	// 	currentNetworkUsed.name !== network.name ||
	// 	currentNetworkUsed.chainId !== network.chainId ||
	// 	currentNetworkUsed.rpc !== network.rpc

	return isChanged
}

// NOTE; We need one instance of local provider
// but it need result to be updated when some relayer cfg props are changed
const localWeb3 = new (function() {
	let localProvider = null
	let network = null
	let result = null

	this.getEthers = () => {
		if (!localProvider) {
			network = selectNetwork()
			localProvider = getLocalProvider(network.rpc)
			result = getEthersResult(localProvider, network.id)
		} else if (network && isNetworkChanged(network)) {
			network = selectNetwork()
			localProvider = getLocalProvider(network.rpc)
			result = getEthersResult(localProvider, network.id)
		}
		return result
	}
})()

const loadInjectedWeb3 = new Promise(async (resolve, reject) => {
	const provider = await detectEthereumProvider()

	if (!!window.ethereum && provider !== window.ethereum) {
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
			// const requestedAddresses =
			await ethereum.request({
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

			const provider = new providers.Web3Provider(ethereum)
			const providerNetwork = await provider.getNetwork()
			const { chainId } = providerNetwork
			const networkId = selectNetworkByChainId(null, chainId)

			return getEthersResult(provider, networkId)
		} catch (err) {
			console.error('Err getting injected ethereum.', err)
			throw new Error(err.message)
		}
	}
}

const getLocalWeb3Provider = async () => {
	return localWeb3.getEthers()
}

const getEthersReadOnly = () => {
	return getLocalWeb3Provider()
}

const getEthers = authType => {
	/* NOTE: use Promise wrapper because despite getWeb3 is Promise itself it is not called by user action
	 *   and this results in Trezor popup block by the browser
	 */

	const mode = authType || selectAuthType()

	if (mode === AUTH_TYPES.METAMASK.name) {
		return injectedWeb3Provider()
	} else {
		return getLocalWeb3Provider()
	}
}

const ethereumNetworkId = async () => {
	const { ethereum } = await loadInjectedWeb3
	if (ethereum) {
		const chainId = await ethereum.request({ method: 'net_version' })

		const id = parseInt(chainId, 10)
		return id
	} else {
		return null
	}
}

const getEthereumProviderName = async () => {
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
	getEthersReadOnly,
	ethereumNetworkId,
	getEthereumProviderName,
	getMetamaskEthereum,
	getMetamaskSelectedAddress,
}

import Web3 from 'web3'

import tokenAbi from './abi/ADXToken'
import registryAbi from './abi/ADXRegistry'
import exchangeAbi from './abi/ADXExchange'

const mainnetCfg = {
	node: 'https://mainnet.infura.io/W0a3PCAj1UfQZxo5AIrv',
	addr: {
		token: '0x4470BB87d77b963A013DB939BE332f927f2b992e',
		registry: '0xeaf503fd64d0cf9278f29775b78c6f31001ffebc',
		exchange: '0x0f6029ebde2ecd9ab4d60dd5d0a297e9e59bf77a',
	}
}



// TEMP
const cfg = mainnetCfg

const web3 = new Web3()
web3.setProvider(new Web3.providers.HttpProvider(cfg.node))

// web3 0.20.x (0.x)
//const token = web3.eth.contract(tokenAbi).at(cfg.addr.token)

// web3 1.x
const token = new web3.eth.Contract(tokenAbi, cfg.addr.token)
const registry = new web3.eth.Contract(registryAbi, cfg.addr.registry)
const exchange = new web3.eth.Contract(exchangeAbi, cfg.addr.exchange)

export {
	web3,
	token,
	registry,
	exchange
}
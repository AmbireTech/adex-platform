import Web3 from 'web3'

import tokenAbi from './abi/ADXToken'
import registryAbi from './abi/ADXRegistry'
import exchangeAbi from './abi/ADXExchange'

const mainnetCfg = {
	node: 'https://parity.wings.ai',
	addr: {
		token: '0x4470BB87d77b963A013DB939BE332f927f2b992e',
		registry: '0xeaf503fd64d0cf9278f29775b78c6f31001ffebc',
		exchange: '0x0f6029ebde2ecd9ab4d60dd5d0a297e9e59bf77a',
	}
}

const testrpcCfg = {
	node: '//192.168.10.23:8545/',
	addr: {
		token: '0x8609e07ad09f97a33fd75553afc779849c952dae',
		registry: '0x897a214ec2124cb1015846ed83f378e56bbe764c',
		exchange: '0xc3ec25c840079662777e3aa379f79de1c7533220',
	}
}

// TEMP
let cfg

if (process.env.NODE_ENV === 'production') {
	cfg = mainnetCfg
} else {
	cfg = testrpcCfg
}

const web3 = new Web3()
web3.setProvider(new Web3.providers.HttpProvider(cfg.node))

// web3 0.20.x (0.x)
//const token = web3.eth.contract(tokenAbi).at(cfg.addr.token)

// web3 1.x
const token = new web3.eth.Contract(tokenAbi, cfg.addr.token)
const registry = new web3.eth.Contract(registryAbi, cfg.addr.registry)
const exchange = new web3.eth.Contract(exchangeAbi, cfg.addr.exchange)

export {
	cfg,
	web3,
	token,
	registry,
	exchange
}
import Web3 from 'web3'

import tokenAbi from './abi/ADXToken'
import registryAbi from './abi/ADXRegistry'
import exchangeAbi from './abi/ADXExchange'
import { testrpcCfg } from './ADXTestrpcCfg'

const mainnetCfg = {
	node: 'https://parity.wings.ai',
	addr: {
		token: '0x4470BB87d77b963A013DB939BE332f927f2b992e',
		exchange: '0x0f6029ebde2ecd9ab4d60dd5d0a297e9e59bf77a', // TODO:
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
const exchange = new web3.eth.Contract(exchangeAbi, cfg.addr.exchange)

export {
	cfg,
	web3,
	token,
	exchange
}
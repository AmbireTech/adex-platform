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

let getWeb3 = new Promise(function (resolve, reject) {
	// Wait for loading completion to avoid race conditions with web3 injection timing.
	window.addEventListener('load', function () {
		var results
		var web3 = window.web3

		// Checking if Web3 has been injected by the browser (Mist/MetaMask)
		if (typeof web3 !== 'undefined') {
			// Use Mist/MetaMask's provider.
			web3 = new Web3(web3.currentProvider)

			results = {
				web3: web3
			}

			console.log('Injected web3 detected.');

			resolve(results)
		} else {
			// Fallback to localhost if no web3 injection. We've configured this to
			// use the development console's port by default.
			var provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545')

			web3 = new Web3(provider)

			results = {
				web3: web3
			}

			console.log('No web3 instance injected, using Local web3.');

			resolve(results)
		}
	})
})

export {
	cfg,
	web3,
	token,
	exchange,
	getWeb3
}
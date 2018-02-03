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

const getWeb3 = new Promise(function (resolve, reject) {
	// Wait for loading completion to avoid race conditions with web3 injection timing.
	window.addEventListener('load', function () {
		let results
		let web3 = window.web3

		// Checking if Web3 has been injected by the browser (Mist/MetaMask)
		if (typeof web3 !== 'undefined') {
			// Use Mist/MetaMask's provider.
			web3 = new Web3(web3.currentProvider)

			console.log('web3.currentProvider', web3.currentProvider)

			results = {
				web3: web3
			}

			console.log('Injected web3 detected.')
		} else {
			// Fallback to localhost if no web3 injection. We've configured this to
			// use the development console's port by default.
			let provider = new Web3.providers.HttpProvider('http://127.0.0.1:9545')

			web3 = new Web3(provider)

			results = {
				web3: web3
			}

			console.log('No web3 instance injected, using Local web3.')
		}

		// web3 1.x
		let token = new web3.eth.Contract(tokenAbi, cfg.addr.token)
		let exchange = new web3.eth.Contract(exchangeAbi, cfg.addr.exchange)

		results.cfg = cfg
		results.token = token
		results.exchange = exchange

		resolve(results)
	})
})

const web3Utils = Web3.utils

export  {
	cfg,
	getWeb3,
	web3Utils
}
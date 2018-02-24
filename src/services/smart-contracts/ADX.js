import Web3 from 'web3'

import tokenAbi from './abi/ADXToken'
import exchangeAbi from './abi/ADXExchange'
import { testrpcCfg } from './ADXTestrpcCfg'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'

const mainnetCfg = {
	node: process.env.WEB3_NODE || 'https://parity.wings.ai',
	addr: {
		token: process.env.ADX_TOKEN_ADDR || '0x4470BB87d77b963A013DB939BE332f927f2b992e',
		exchange: process.env.ADX_EXCHANGE_ADDR || '0x912b8f85E28B9ec196b48228159E2f13546836e6',
	}
}

// TEMP
let cfg

// if (process.env.NODE_ENV === 'production') {
	cfg = mainnetCfg
// } else {
// 	cfg = testrpcCfg
// }

const getWeb3 = new Promise(function (resolve, reject) {
	// Wait for loading completion to avoid race conditions with web3 injection timing.
	window.addEventListener('load', function () {
		let web3 = window.web3
		let mode = null // metamask, and as some point trezor, ledger, ...

		// Checking if Web3 has been injected by the browser (Mist/MetaMask)
		if (typeof web3 !== 'undefined') {
			// Use Mist/MetaMask's provider.
			web3 = new Web3(web3.currentProvider)
			mode = EXCHANGE_CONSTANTS.SIGN_TYPES.Eip.id // Currently only metamask

			console.log('web3.currentProvider', web3.currentProvider)
			console.log('Injected web3 detected.')
		} else {
			// Fallback to localhost if no web3 injection. We've configured this to
			// use the development console's port by default.
			let provider = new Web3.providers.HttpProvider(cfg.node)
			web3 = new Web3(provider)
			console.log('No web3 instance injected, using Local web3.')
		}

		console.log('web3', web3)

		// web3 1.x
		let token = new web3.eth.Contract(tokenAbi, cfg.addr.token)
		let exchange = new web3.eth.Contract(exchangeAbi, cfg.addr.exchange)

		let results = {
			web3: web3,
			mode: mode,
			cfg: cfg,
			token: token,
			exchange: exchange
		}

		resolve(results)
	})
})

const web3Utils = Web3.utils

export {
	cfg,
	getWeb3,
	web3Utils
}
import Web3 from 'web3'

import tokenAbi from './abi/ADXToken'
import exchangeAbi from './abi/ADXExchange'
import { testrpcCfg } from './ADXTestrpcCfg'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'
import { AUTH_TYPES } from 'constants/misc'

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

const getInjectedWeb3 = new Promise(function (resolve, reject) {
	// Wait for loading completion to avoid race conditions with web3 injection timing.
	window.addEventListener('load', function () {
		console.log('getInjectedWeb3')
		let web3 = window.web3
		let mode = null // metamask, and as some point trezor, ledger, ...
		let token = null
		let exchange = null

		// Checking if Web3 has been injected by the browser (Mist/MetaMask)
		if (typeof web3 !== 'undefined') {
			// Use Mist/MetaMask's provider.
			web3 = new Web3(web3.currentProvider)
			// mode = EXCHANGE_CONSTANTS.SIGN_TYPES.Eip.id // Currently only metamask
			token = new web3.eth.Contract(tokenAbi, cfg.addr.token)
			exchange = new web3.eth.Contract(exchangeAbi, cfg.addr.exchange)
			
			// console.log('web3.currentProvider', web3.currentProvider)
			console.log('Injected web3 detected.')
			let results = {
				web3: web3,
				// mode: mode,
				cfg: cfg,
				token: token,
				exchange: exchange
			}

			resolve(results)
		} else {
			
			console.log('No web3 instance injected, using Local web3.')
			reject(new Error('No metamask injected web3 found'))
		}
	})
})

const getLocalWeb3 = new Promise(function (resolve, reject) {
	console.log('getLocalWeb3')
	let provider = new Web3.providers.HttpProvider(cfg.node)
	let web3 = new Web3(provider)
	// let mode = EXCHANGE_CONSTANTS.SIGN_TYPES.Trezor.id
	let token = new web3.eth.Contract(tokenAbi, cfg.addr.token)
	let exchange = new web3.eth.Contract(exchangeAbi, cfg.addr.exchange)
	
	let results = {
		web3: web3,
		// mode: mode,
		cfg: cfg,
		token: token,
		exchange: exchange
	}

	resolve(results)
})

const getWeb3 = (mode) => {
	if(mode === AUTH_TYPES.METAMASK.name) {
		return getInjectedWeb3
	} else {
		return getLocalWeb3
	}
}

const web3Utils = Web3.utils

export {
	cfg,
	getWeb3,
	web3Utils
}
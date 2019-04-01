import ethTx from 'ethereumjs-tx'
import { getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { getEthers } from 'services/smart-contracts/ethers'
import { ethers } from 'ethers'
import { TO_HEX_PAD } from 'services/smart-contracts/constants'
import { getRsvFromSig, getTypedDataHash } from 'services/smart-contracts/utils'
import trezorConnect from 'third-party/trezor-connect'
import ledgerTransport from '@ledgerhq/hw-transport-u2f'
import ledgerEth from "@ledgerhq/hw-app-eth"
import rlp from 'rlp'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'
import { AUTH_TYPES } from 'constants/misc'
import actions from 'actions'
import { translate } from 'services/translations/translations'
const ethereumjs = require('ethereumjs-util')
const { toBuffer, ecrecover, pubToAddress } = ethereumjs


const TrezorConnect = trezorConnect.TrezorConnect

const PRODUCTION_MODE = process.env.NODE_ENV === 'production'

const { SIGN_TYPES, TX_STATUS } = EXCHANGE_CONSTANTS

export const setWallet = ({ prKey, addr = '' }) => {

	return new Promise((resolve, reject) => {

		getWeb3().then(({ web3, exchange, token }) => {

			/* HACK: because of the testrpc
            * generated addr from prKey (no leading 0x) is different than needed for testrpc 
            */
			if (addr && !web3Utils.isAddress(addr)) {
				throw 'invalid eth address'
			}

			let cleanPrKey = prKey.replace(/^(0[xX])/, '')

			if (cleanPrKey.length !== 64) {
				throw 'invalid private key'
			}

			// NOTE: because of the way web3 works, it needs key prefixed with 0x
			// see https://github.com/ethereum/web3.js/issues/1094
			// NOTE: in development mode testrpc pr key need to be without 0x
			if (PRODUCTION_MODE) {
				prKey = '0x' + cleanPrKey
			} else {
				prKey = cleanPrKey
			}

			let wallet = web3.eth.accounts.wallet
			let acc = web3.eth.accounts.privateKeyToAccount(prKey)

			wallet.add(acc)

			// NOTE: in production privateKeyToAccount generates different address when  w/ or w/o 0x
			// for testrpc the generated
			if (PRODUCTION_MODE) {
				addr = wallet[0].address
			}

			// console.log('setWalletAndGetAddress addr', addr)
			// console.log('setWalletAndGetAddress prKey', prKey)

			return resolve({ addr: addr, prKey: prKey })
		})
	})
}

export const getAccountMetamask = () => {
	return new Promise((resolve, reject) => {
		getWeb3(AUTH_TYPES.METAMASK.name).then(({ web3 }) => {
			let mode = AUTH_TYPES.METAMASK.signType

			web3.eth.getAccounts((err, accounts) => {
				//TODO: maybe different check for different modes
				if (err || !accounts || !accounts[0]) {
					return resolve({ addr: null, mode })
				} else if (accounts && accounts[0]) {
					return resolve({ addr: accounts[0].toLowerCase(), mode })
				} else {
					return resolve({ addr: null, mode })
				}
			})
		})
	})
}

export const signTypedMetamask = ({ userAddr, typedData, authType, hash }) => {
	return new Promise((resolve, reject) => {

		getWeb3(authType).then(({ web3, exchange, token, mode }) => {


			web3.eth.personal.sign(hash, userAddr,
				(err, res) => {

					if (err) {
						return reject(err)
					}

					if (res.error) {
						return reject(res.error)
					}

					let signature = { sig: res, hash: hash, mode: SIGN_TYPES.EthPersonal.id }
					return resolve(signature)
				})

			// Temp disable until metamsak fix eth_signTypedData
			// web3.currentProvider.sendAsync({
			//     method: 'eth_signTypedData',
			//     params: [typedData, userAddr],
			//     from: userAddr
			// }, (err, res) => {
			//     if (err) {
			//         return reject(err)
			//     }

			//     if (res.error) {
			//         return reject(res.error)
			//     }

			//     let signature = { sig: res.result, hash: hash, mode: SIGN_TYPES.Eip.id }
			//     return resolve(signature)
			// })
		})
	})
}

export const signTypedTrezor = ({ userAddr, hdPath, addrIdx, typedData, hash }) => {
	return new Promise((resolve, reject) => {

		let buff = Buffer.from(hash.slice(2), 'hex')
		TrezorConnect.ethereumSignMessage(
			hdPath + '/' + addrIdx, buff, (resp) => {
				if (resp.success) {
					const sig = '0x' + resp.signature
					const isLegacy = isLegacyTrezorSignature({ sig, hash, userAddr })

					const signature = { sig: sig, hash: hash, mode: isLegacy ? SIGN_TYPES.Trezor.id : SIGN_TYPES.EthPersonal.id }

					return resolve(signature)
				} else {
					return reject(resp)
				}
			}
		)
	})
}

const isLegacyTrezorSignature = ({ sig, hash, userAddr }) => {
	const legacyMsg = web3Utils.soliditySha3('\x19Ethereum Signed Message:\n\x20', hash)
	const signature = getRsvFromSig(sig)
	const pubKey = ecrecover(toBuffer(legacyMsg), signature.v, toBuffer(signature.r), toBuffer(signature.s))
	const addr = '0x' + (pubToAddress(pubKey)).toString('hex')
	return addr === userAddr
}

export const signTypedLedger = ({ userAddr, hdPath, addrIdx, typedData, hash }) => {
	return ledgerTransport.create()
		.then((comm) => {
			var eth = new ledgerEth(comm)
			var dPath = hdPath + '/' + addrIdx
			var buf = Buffer.from(hash.slice(2), 'hex')
			return eth.signPersonalMessage(dPath, buf.toString('hex'))
		})
		.then((result) => {
			var v = result['v']
			v = v.toString(16)
			if (v.length < 2) {
				v = '0' + v
			} // pad v

			let signature = {
				sig: '0x' + result['r'] + result['s'] + v,
				hash: hash, mode: SIGN_TYPES.EthPersonal.id
			}
			return signature
		})
}

export const signTypedLocal = async ({ privateKey, authType, address, addrIdx, typedData, hash }) => {
	const wallet = new ethers.Wallet(privateKey)
	const hashBytes = ethers.utils.arrayify(hash)
	const sig = await wallet.signMessage(hashBytes)
	const signature = { sig: sig, hash, mode: SIGN_TYPES.EthPersonal.id }

	return signature
}

export const signTypedMsg = ({ authType, userAddr, hdPath, addrIdx, typedData, privateKey }) => {
	let pr

	const hash = getTypedDataHash({ typedData: typedData })

	switch (authType) {
	case AUTH_TYPES.TREZOR.name:
		pr = signTypedTrezor({ userAddr, hdPath, addrIdx, typedData, hash })
		break
	case AUTH_TYPES.METAMASK.name:
		pr = signTypedMetamask({ userAddr, typedData, authType: AUTH_TYPES.METAMASK.name, hash })
		break
	case AUTH_TYPES.LEDGER.name:
		pr = signTypedLedger({ userAddr, typedData, authType: AUTH_TYPES.METAMASK.name, hash, hdPath, addrIdx })
		break
	case AUTH_TYPES.GRANT.name:
		pr = signTypedLocal({ userAddr, typedData, authType: AUTH_TYPES.GRANT.name, hash, hdPath, addrIdx, privateKey })
		break
	default:
		pr = Promise.reject(new Error('Invalid authentication type!'))
	}

	return pr
}

export const signAuthToken = ({ authType, userAddr, hdPath, addrIdx, privateKey }) => {
	let authToken = 46 || (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
	let typedData = [
		{ type: 'uint', name: 'Auth token', value: authToken }
	]

	let pr = signTypedMsg({ authType, userAddr, hdPath, addrIdx, typedData, privateKey })
	return pr.then((res = {}) => {
		let sig = { sig_mode: res.mode, sig: res.sig, authToken: authToken, typedData, hash: res.hash }
		return sig
	})
}

const sanitizeHex = (hex) => {
	hex = hex.substring(0, 2) == '0x' ? hex.substring(2) : hex
	if (hex == "") return undefined
	return '0x' + padLeftEven(hex)
}

const padLeftEven = (hex) => {
	hex = hex.length % 2 != 0 ? '0' + hex : hex
	return hex;
}

// NOTE: not the best place to do such updates but we need 
// the tx and notifications on tx hash when there a re more than one tx for action
const addTx = (tx, addr, account, nonce) => {
	let txData = { ...tx }
	txData.status = TX_STATUS.Pending.id
	txData.sendingTime = Date.now()
	actions.execute(actions.addWeb3Transaction({ trans: txData, addr: addr }))
	actions.execute(actions.addToast({
		type: 'accept',
		action: 'X',
		label: translate('TRANSACTION_SENT_MSG', { args: [tx.txHash] }),
		timeout: 5000
	}))

	let settings = { ...account._settings }
	settings.nonce = nonce + 1
	actions.execute(actions.updateAccount({ ownProps: { settings: settings } }))
}

const txSend = ({ tx, opts, txSuccessData, from, account, nonce }) => {
	return new Promise((resolve, reject) => {
		(tx.send ? tx.send(opts) : tx(opts))
			.on('transactionHash', (txHash) => {
				let res = { ...txSuccessData, txHash }
				addTx(res, from, account, nonce)
				return resolve(res)
			})
			.on('error', (err) => {
				return reject(err)
			})
	})
}

const sendTxTrezor = ({ provider, rawTx, account, txSuccessData, nonce, from }) => {
	console.log('sendTxTrezor')
	return new Promise((resolve, reject) => {
		TrezorConnect.ethereumSignTx(
			account._wallet.hdWalletAddrPath + '/' + account._wallet.hdWalletAddrIdx,
			rawTx.nonce.slice(2),
			rawTx.gasPrice.slice(2),
			rawTx.gasLimit.slice(2),
			rawTx.to.slice(2),
			rawTx.value.slice(2),
			rawTx.data.slice(2),
			rawTx.chainId,
			(response) => {
				if (response.success) {
					rawTx.v = '0x' + response.v.toString(16)
					rawTx.r = '0x' + response.r
					rawTx.s = '0x' + response.s
					var eTx = new ethTx(rawTx);
					var signedTx = '0x' + eTx.serialize().toString('hex')

					const tx = provider.sendTransaction

					txSend({ tx, opts: signedTx, txSuccessData, from, account, nonce })
						.then((res) => {
							return resolve(res)
						})
						.catch((err) => {
							return reject(err)
						})
				} else {
					return reject(response)
				}
			})
	})
}

const sendTxLedger = ({ provider, rawTx, account, txSuccessData, nonce, from }) => {
	// console.log('sendTxLedger', ledger)
	// return new Promise((resolve, reject) => {
	const eTx = new ethTx(rawTx)
	eTx.raw[6] = Buffer.from([rawTx.chainId])
	eTx.raw[7] = eTx.raw[8] = 0
	const toHash = eTx.raw // old ? eTx.raw.slice(0, 6) : eTx.raw
	const txToSign = rlp.encode(toHash)

	return ledgerTransport.create()
		.then((comm) => {
			const eth = new ledgerEth(comm)

			const dPath = account._wallet.hdWalletAddrPath + '/' + account._wallet.hdWalletAddrIdx

			return eth.signTransaction(dPath, txToSign.toString('hex'))
		})
		.then((result) => {
			const rewTxSigned = { ...rawTx }
			rewTxSigned.v = '0x' + result['v']
			rewTxSigned.r = '0x' + result['r']
			rewTxSigned.s = '0x' + result['s']

			const eTxSigned = new ethTx(rewTxSigned)
			const signedTx = '0x' + eTxSigned.serialize().toString('hex')
			const tx = provider.sendTransaction

			return txSend({ tx, opts: signedTx, txSuccessData, from, account, nonce })
		})
}

export const sendTx = async ({ provider, tx, opts = {}, account, txSuccessData, prevNonce = 0, nonceIncrement = 0 }) => {
	const authType = account._wallet.authType
	const options = { ...opts }
	options.gasPrice = opts.gasPrice || account._settings.gasPrice
	const userNonce = account._settings.nonce || 0
	const from = options.from

	if (authType === AUTH_TYPES.METAMASK.name) {
		return txSend({ tx, opts: options, txSuccessData, from, account })
	}

	/*
    * TODO: send pending tx from here for e.g. When deposit to exchange if user confirm the allowance
    * but cancel the second transaction for the deposit currently it returns error ant the first tx is not added to transactions;
    * When all transactions are completed we just have to close the popup and clean the tx data from the store
    */
	const chainId = provider.chainId
	const chainNonce = await provider.getTransactionCount(account._wallet.address)
	const nonce = Math.max(chainNonce, prevNonce, userNonce) + nonceIncrement

	const rawTx = {
		nonce: sanitizeHex(nonce.toString(16)),
		gasPrice: sanitizeHex((parseInt(options.gasPrice, 10) || 4009951502).toString(16)),
		gasLimit: sanitizeHex((parseInt(options.gas, 10)).toString(16)),
		to: tx._parent ? tx._parent._address : options.to,
		value: sanitizeHex((options.value || 0).toString(16)),
		data: tx.encodeABI ? tx.encodeABI() : null,
		chainId,
	}

	txSuccessData = { ...txSuccessData }
	txSuccessData.nonce = nonce

	if (authType === AUTH_TYPES.TREZOR.name) {
		return sendTxTrezor({ provider, rawTx, account, opts: options, txSuccessData, nonce, from })
	}
	if (authType === AUTH_TYPES.LEDGER.name) {
		return sendTxLedger({ provider, rawTx, account, opts: options, txSuccessData, nonce, from })
	}
}


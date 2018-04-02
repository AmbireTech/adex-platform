import ethTx from 'ethereumjs-tx'
import { getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { TO_HEX_PAD } from 'services/smart-contracts/constants'
import { getRsvFromSig, getTypedDataHash } from 'services/smart-contracts/utils'
import trezorConnect from 'third-party/trezor-connect'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'
import { AUTH_TYPES } from 'constants/misc'
const TrezorConnect = trezorConnect.TrezorConnect

const PRODUCTION_MODE = process.env.NODE_ENV === 'production'

const { SIGN_TYPES } = EXCHANGE_CONSTANTS

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

            web3.currentProvider.sendAsync({
                method: 'eth_signTypedData',
                params: [typedData, userAddr],
                from: userAddr
            }, (err, res) => {
                if (err) {
                    return reject(err)
                }

                if (res.error) {
                    return reject(res.error)
                }

                let signature = { sig: res.result, hash: hash }
                return resolve(signature)
            })
        })
    })
}

export const signTypedTrezor = ({ userAddr, hdPath, mode, addrIdx, typedData, hash }) => {
    return new Promise((resolve, reject) => {

        let buff = Buffer.from(hash.slice(2), 'hex')
        TrezorConnect.ethereumSignMessage(
            hdPath + '/' + addrIdx, buff, (resp) => {
                if (resp.success) {
                    let signature = { sig: '0x' + resp.signature, hash: hash }
                    return resolve(signature)
                } else {
                    return reject(resp)
                }

            }
        )
    })
}

export const signTypedMsg = ({ mode, userAddr, hdPath, addrIdx, typedData }) => {
    let pr

    let hash = getTypedDataHash({ typedData: typedData })

    switch (mode) {
        case SIGN_TYPES.Trezor.id:
            pr = signTypedTrezor({ userAddr, hdPath, mode, addrIdx, typedData, hash })
            break
        case SIGN_TYPES.Eip.id:
            pr = signTypedMetamask({ userAddr, typedData, authType: AUTH_TYPES.METAMASK.name, hash })
            break
        default:
            pr = Promise.reject(new Error('Invalid signature mode!'))
    }

    return pr
}

export const signAuthToken = ({ mode, userAddr, hdPath, addrIdx }) => {
    let authToken = (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
    let typedData = [
        { type: 'uint', name: 'Auth token', value: authToken }
    ]

    let pr = signTypedMsg({ mode, userAddr, hdPath, addrIdx, typedData })

    return pr.then((res = {}) => {
        let sig = { sig_mode: mode, sig: res.sig, authToken: authToken, typedData, hash: res.hash }

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

const sendTxTrezor = ({ web3, rawTx, user, txSuccessData }) => {
    console.log('sendTxTrezor')
    return new Promise((resolve, reject) => {
        TrezorConnect.ethereumSignTx(
            user._hdWalletAddrPath + '/' + user._hdWalletAddrIdx,
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
                    web3.eth.sendSignedTransaction(signedTx)
                        .on('transactionHash', (trHash) => {
                            let res = { ...txSuccessData, trHash }
                            console.log('transactionHash', res)
                            return resolve(res)
                        })
                        .on('error', (err) => {
                            console.log('transactionHash err', err)
                            return reject(err)
                        })
                } else {
                    return reject(response)
                }
            })
    })
}

const txSend = ({ tx, opts, txSuccessData }) => {
    return new Promise((resolve, reject) => {
        (tx.send ? tx.send(opts) : tx(opts))
            .on('transactionHash', (trHash) => {
                let res = { ...txSuccessData, trHash }
                console.log('res', res)
                return resolve(res)
            })
            .on('error', (err) => {
                console.log('err', err)
                return reject(err)
            })
    })
}

export const sendTx = ({ web3, tx, opts = {}, user, txSuccessData }) => {
    let authType = user._authType
    opts = { ...opts }
    opts.gasPrice = user._settings.gasPrice

    return web3.eth.net.getId()
        .then((netId) => {
            let rawTx = {
                nonce: sanitizeHex(Date.now().toString(16)),
                gasPrice: sanitizeHex((parseInt(opts.gasPrice, 10) || 4009951502).toString(16)),
                gasLimit: sanitizeHex((parseInt(opts.gas, 10)).toString(16)),
                to: tx._parent ? tx._parent._address : opts.to,
                value: sanitizeHex((opts.value || 0).toString(16)),
                data: tx.encodeABI ? tx.encodeABI() : null,
                chainId: netId,
            }

            return rawTx
        })
        .then((rawTx) => {
            console.log('authType', authType)
            if (authType === AUTH_TYPES.TREZOR.name) {
                return sendTxTrezor({ web3, rawTx, user, opts, txSuccessData })
            } else {
                return txSend({ tx, opts, txSuccessData })
            }
        })
}


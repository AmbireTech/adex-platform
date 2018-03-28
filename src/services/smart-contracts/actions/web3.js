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

export const signAuthTokenMetamask = ({ userAddr, typedData, authType }) => {
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

                let signature = { sig: res.result }
                return resolve(signature)
            })
        })
    })
}

export const signAuthTokenTrezor = ({ userAddr, hdPath, mode, addrIdx, typedData }) => {
    return new Promise((resolve, reject) => {

        let hash = getTypedDataHash({typedData: typedData})

        let buff = Buffer.from(hash.slice(2), 'hex')
        TrezorConnect.ethereumSignMessage(
            hdPath + '/' + addrIdx, buff, (resp) => {
                if (resp.success) {
                    let signature = { sig: '0x' + resp.signature, hashData: hash }
                    return resolve(signature)
                } else {
                    return reject(resp)
                }
                
            }
        )
    })
}

export const signAuthToken = ({ mode, userAddr, hdPath, addrIdx }) => {
    let authToken = (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
    let typedData = [
        { type: 'uint', name: 'Auth token', value: authToken }
    ]

    let pr

    switch(mode) {
        case SIGN_TYPES.Trezor.id:
            pr =  signAuthTokenTrezor({ userAddr, hdPath, mode, addrIdx, typedData })
            break
        case SIGN_TYPES.Eip.id:
            pr =  signAuthTokenMetamask({ userAddr, typedData, authType: AUTH_TYPES.METAMASK.name })
            break
        default:
            pr = Promise.reject(new Error('Invalid signature mode!'))
    }

    return pr.then((res = {}) => {
        let sig = { sig_mode: mode, sig: res.sig, authToken: authToken, typedData, hashData: res.hashData }

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

const sendTxTrezor = ({web3, rawTx, user}) => {
    console.log('sendTxTrezor')
    return new Promise((resolve, reject) => {
    console.log('rawTx', rawTx)
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

                    console.log('signedTx', signedTx)

                    // TODO: use .on('transactionHash/error')
                    // web3.eth.sendSignedTransaction(signedTx, function (err, resp) {
                    //     resolve(resp)
                    // })
                } else {
                    console.log('response no success', signedTx)
                    reject(response)
                }

            })
        })
}

export const sendTx = ({ tx, opts = {}, user }) => {
    let web3 = null
    let authType = user._authType

    let rawTx = {
        nonce: sanitizeHex(Date.now().toString(16)),
        gasPrice: sanitizeHex((opts.gasPrice || 3009951502 ).toString(16)),
        gasLimit: sanitizeHex(opts.gas.toString(16)),
        to: tx._parent._address,
        value: sanitizeHex((opts.value || 0).toString(16)),
        data: tx.encodeABI(),
        chainId: 1,
    }

    sendTxTrezor({ web3, rawTx, user })

    // TODO: When first call getWeb3, getId trezor popup is blocked ...

    // return getWeb3(authType)
    //     .then(({ web3 }) => {
    //        return web3.eth.net.getId()
    //     })
    //     .then((netId) => {
    //         let rawTx = {
    //             nonce: sanitizeHex(Date.now().toString(16)),
    //             gasPrice: sanitizeHex((opts.gasPrice || 3009951502 ).toString(16)),
    //             gasLimit: sanitizeHex(opts.gas.toString(16)),
    //             to: tx._parent._address,
    //             value: sanitizeHex((opts.value || 0).toString(16)),
    //             data: tx.encodeABI(),
    //             chainId: netId,
    //         }

    //         return rawTx
    //     })   
    //     .then((rawTx)=> {
    //         console.log('authType', authType)
    //         if(authType === AUTH_TYPES.TREZOR.name ){
    //             sendTxTrezor({ web3, rawTx, user })
    //         }
    //     })    
    
}


import ethTx from 'ethereumjs-tx'
import { getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { TO_HEX_PAD } from 'services/smart-contracts/constants'
import { getRsvFromSig, getTypedDataHash } from 'services/smart-contracts/utils'
import trezorConnect from 'third-party/trezor-connect'
import ledger from 'ledgerco' //'third-party/ledger.min'
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
    console.log('signTypedLedger')
    return ledger.comm_u2f.create_async()
        .then((comm) => {
            var eth = new ledger.eth(comm)
            var dPath = hdPath + '/' + addrIdx
            var buf = Buffer.from(hash.slice(2), 'hex')
            return eth.signPersonalMessage_async(dPath, buf.toString('hex'))
        })
        .then((result) => {
            var v = result['v']
            v = v.toString(16)
            if (v.length < 2) {
                v = '0' + v
            } // pad v

            let signature = { sig: '0x' + result['r'] + result['s'] + v, hash: hash, mode: SIGN_TYPES.EthPersonal.id }
            return signature
        })
}

export const signTypedMsg = ({ authType, userAddr, hdPath, addrIdx, typedData }) => {
    let pr

    let hash = getTypedDataHash({ typedData: typedData })

    console.log('hash', hash)
    console.log('authType', authType)

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
        default:
            pr = Promise.reject(new Error('Invalid authentication type!'))
    }

    return pr
}

export const signAuthToken = ({ authType, userAddr, hdPath, addrIdx }) => {
    let authToken = (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
    let typedData = [
        { type: 'uint', name: 'Auth token', value: authToken }
    ]

    let pr = signTypedMsg({ authType, userAddr, hdPath, addrIdx, typedData })
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

// NOTE: not the best place to do such updates but we need the tx and notifications on tx hash when there a re more than one tx for action
const addTx = (tx, addr, user, nonce) => {
    let txData = { ...tx }
    txData.status = TX_STATUS.Pending.id
    txData.sendingTime = Date.now()
    actions.execute(actions.addWeb3Transaction({ trans: txData, addr: addr }))
    actions.execute(actions.addToast({ type: 'accept', action: 'X', label: translate('TRANSACTION_SENT_MSG', { args: [tx.trHash] }), timeout: 5000 }))

    let settings = { ...user._settings }
    settings.nonce = nonce + 1
    actions.execute(actions.updateAccount({ ownProps: { settings: settings } }))

}

const txSend = ({ tx, opts, txSuccessData, from, user, nonce }) => {
    return new Promise((resolve, reject) => {
        (tx.send ? tx.send(opts) : tx(opts))
            .on('transactionHash', (trHash) => {
                let res = { ...txSuccessData, trHash }
                addTx(res, from, user, nonce)
                return resolve(res)
            })
            .on('error', (err) => {
                return reject(err)
            })
    })
}

const sendTxTrezor = ({ web3, rawTx, user, txSuccessData, nonce, from }) => {
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

                    const tx = web3.eth.sendSignedTransaction

                    txSend({ tx, opts: signedTx, txSuccessData, from, user, nonce })
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

const sendTxLedger = ({ web3, rawTx, user, txSuccessData, nonce, from }) => {
    console.log('sendTxLedger', ledger)
    // return new Promise((resolve, reject) => {
    const eTx = new ethTx(rawTx)
    eTx.raw[6] = Buffer.from([rawTx.chainId])
    eTx.raw[7] = eTx.raw[8] = 0
    const toHash = eTx.raw // old ? eTx.raw.slice(0, 6) : eTx.raw
    const txToSign = rlp.encode(toHash)

    return ledger.comm_u2f.create_async()
        .then((comm) => {
            const eth = new ledger.eth(comm)

            const dPath = user._hdWalletAddrPath + '/' + user._hdWalletAddrIdx

            return eth.signTransaction_async(dPath, txToSign.toString('hex'))
        })
        .then((result) => {
            const rewTxSigned = { ...rawTx }
            rewTxSigned.v = '0x' + result['v']
            rewTxSigned.r = '0x' + result['r']
            rewTxSigned.s = '0x' + result['s']

            const eTxSigned = new ethTx(rewTxSigned)
            const signedTx = '0x' + eTxSigned.serialize().toString('hex')
            const tx = web3.eth.sendSignedTransaction

            return txSend({ tx, opts: signedTx, txSuccessData, from, user, nonce })
        })
}

export const sendTx = ({ web3, tx, opts = {}, user, txSuccessData, prevNonce = 0, nonceIncrement = 0 }) => {
    let authType = user._authType
    opts = { ...opts }
    opts.gasPrice = user._settings.gasPrice
    let userNonce = user._settings.nonce || 0
    let netId = null
    const from = opts.from

    if (authType === AUTH_TYPES.METAMASK.name) {
        return txSend({ tx, opts, txSuccessData, from, user })
    }

    /*
    * TODO: send pending tx from here for e.g. When deposit to exchange if user confirm the allowance
    * but cancel the second transaction for the deposit currently it returns error ant the first tx is not added to transactions;
    * When all transactions are completed we just have to close the popup and cleat the tx data from the store
    */
    return web3.eth.net.getId()
        .then((chainId) => {
            netId = chainId
            return web3.eth.getTransactionCount(user._addr)
        })
        .then((nonce) => {
            /**
             * TODO: increment user nonce on tx hash and keep all the info in transactions store 
             * in order to have possibility to send the same tx with higher gas price 
             * (someday for trezor and ledger, metamask keeps its own nonce but it is not work correct in some cases)
             */
            nonce = Math.max(nonce, prevNonce, userNonce) + nonceIncrement
            let rawTx = {
                nonce: sanitizeHex(nonce.toString(16)),
                gasPrice: sanitizeHex((parseInt(opts.gasPrice, 10) || 4009951502).toString(16)),
                gasLimit: sanitizeHex((parseInt(opts.gas, 10)).toString(16)),
                to: tx._parent ? tx._parent._address : opts.to,
                value: sanitizeHex((opts.value || 0).toString(16)),
                data: tx.encodeABI ? tx.encodeABI() : null,
                chainId: netId,
            }

            txSuccessData = { ...txSuccessData }
            txSuccessData.nonce = nonce

            if (authType === AUTH_TYPES.TREZOR.name) {
                return sendTxTrezor({ web3, rawTx, user, opts, txSuccessData, nonce, from })
            }
            if (authType === AUTH_TYPES.LEDGER.name) {
                return sendTxLedger({ web3, rawTx, user, opts, txSuccessData, nonce, from })
            }
        })

}


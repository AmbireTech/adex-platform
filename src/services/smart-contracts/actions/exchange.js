import { getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { toHexParam, ipfsHashToHex } from 'services/smart-contracts/utils'
import { encrypt } from 'services/crypto/crypto'
import { exchange as EXCHANGE_CONSTANTS} from 'adex-constants'

const GAS_LIMIT_ACCEPT_BID = 450000

const logTime = (msg, start, end) => {
    console.log(msg + ' ' + (end - start) + ' ms')
}

export const acceptBid = ({ _advertiser, _adunit, _opened, _target, _amount, _timeout = DEFAULT_TIMEOUT, _adslot, v, r, s, _addr, gas, gasPrice }) => {
    return new Promise((resolve, reject) => {

        getWeb3.then(({ web3, exchange, token }) => {


            let start = Date.now()

            exchange.methods.acceptBid(
                _advertiser,
                ipfsHashToHex(_adunit),
                toHexParam(_opened),
                toHexParam(_target),
                toHexParam(_amount),
                toHexParam(_timeout),
                ipfsHashToHex(_adslot),
                toHexParam(v),
                toHexParam(r),
                toHexParam(s)
            )
                .send({ from: _addr, gas: gas || GAS_LIMIT_ACCEPT_BID, gasPrice: GAS_PRICE })
                .on('transactionHash', (hash) => {
                    let end = Date.now()
                    logTime('trHshEnd', start, end)
                    // console.log('registerItem transactionHash', hash)
                })
                .on('confirmation', (confirmationNumber, receipt) => {
                    let end = Date.now()
                    logTime('confirmation', start, end)
                    console.log('acceptBid confirmation confirmationNumber', confirmationNumber)
                    console.log('acceptBid confirmation receipt', receipt)

                    resolve(receipt)
                })
                .on('receipt', (receipt) => {
                    let end = Date.now()
                    logTime('receipt', start, end)
                    console.log('acceptBid receipt', receipt)
                })
                .on('error', (err) => {
                    let end = Date.now()
                    logTime('error', start, end)
                    console.log('acceptBid err', err)
                    reject(err)
                })

        })
    })
}

const getRsvFromSig = (sig) => {
    sig = sig.slice(2)

    var r = '0x' + sig.substring(0, 64)
    var s = '0x' + sig.substring(64, 128)
    var v = parseInt(sig.substring(128, 130), 16)

    return { r: r, s: s, v: v }
}

export const signBid = ({ typed, userAddr }) => {
    return new Promise((resolve, reject) => {
        getWeb3.then(({ web3, exchange, token, mode }) => {
            console.log('typed', typed)

            let valuesHash = web3Utils.soliditySha3.apply(null, typed.map((entry) => {
                return entry.value
            }))

            let schema = typed.map((entry) => { return entry.type + ' ' + entry.name })
            let schemaHash = web3Utils.soliditySha3.apply(null, schema)

            let hash = web3Utils.soliditySha3(schemaHash, valuesHash)

            // DEBUG
            console.log('schema hash', schemaHash)
            console.log('bid hash', hash)

            if (mode === EXCHANGE_CONSTANTS.SIGN_TYPES.Metamask.id) {
                web3.currentProvider.sendAsync({
                    method: 'eth_signTypedData',
                    params: [typed, userAddr],
                    from: userAddr
                }, (err, res) => {
                    if (err) {
                        return reject(err)
                    }

                    if (res.error) {
                        return reject(res.error)
                    }

                    let signature = { sig_mode: mode, signature: res.result, ...getRsvFromSig(res.result) }
                    return resolve(signature)
                })
            }
        })
    })
}
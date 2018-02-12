import { getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { toHexParam, ipfsHashToHex } from 'services/smart-contracts/utils'
import { encrypt } from 'services/crypto/crypto'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'

const GAS_LIMIT_ACCEPT_BID = 450000

const logTime = (msg, start, end) => {
    console.log(msg + ' ' + (end - start) + ' ms')
}

export const acceptBid = ({ _advertiser, _adunit, _opened, _target, _amount, _timeout = DEFAULT_TIMEOUT, _adslot, v, r, s, sigMode, _addr, gas, gasPrice }) => {
    return new Promise((resolve, reject) => {

        getWeb3.then(({ web3, exchange, token }) => {

            let start = Date.now()

            _opened = Date.now()
            _adunit = ipfsHashToHex(_adunit)
            _adslot = ipfsHashToHex(_adslot)

            console.log('_advertiser', _advertiser)
            console.log('_adunit', _adunit)
            console.log('_opened', _opened)
            console.log('_target', _target)
            console.log('_amount', _amount)
            console.log('_timeout', _timeout)
            console.log('_adslot', _adslot)
            console.log('v', v)
            console.log('r', r)
            console.log('s', s)
            console.log('sigMode', sigMode)
            console.log('_addr', _addr)
            console.log('gas', gas)
            console.log('exchange.methods', exchange.methods)

            exchange.methods.acceptBid(
                _advertiser,
                _adunit,
                _opened.toString(),
                _target.toString(),
                _amount.toString(),
                _timeout.toString(),
                _adslot,
                '0x' + v.toString(16),
                r,
                s,
                sigMode.toString()
            )
                .send({ from: _addr, gas: gas || GAS_LIMIT_ACCEPT_BID })
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
                    // console.log('acceptBid err', err)
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
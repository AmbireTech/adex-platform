import { cfg, getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { setWalletAndGetAddress, toHexParam, ipfsHashToHex } from 'services/smart-contracts/utils'
import { encrypt } from 'services/crypto/crypto'

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

export const signBid = ({ typed, userAddr }) => {
    return new Promise((resolve, reject) => {
        getWeb3.then(({ web3, exchange, token, mode }) => {
            //TODO: set in the model?
            typed = typed.map((entry) => {
                //TODO: Fix it
                if (entry.type === 'bytes32') {
                    entry.value = ipfsHashToHex(entry.value)
                }

                return entry
            })

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

            if (mode === 'metamask') {
                web3.currentProvider.sendAsync({
                    method: 'eth_signTypedData',
                    params: [typed, userAddr],
                    from: userAddr
                }, (err, resp) => {
                    console.log('eth_signTypedData resp', resp)
                    console.log('eth_signTypedData resp.error', resp.error)
                    console.log('eth_signTypedData err', err)
                })
            }
        })
    })
}
import { cfg, exchange, token, web3 } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { setWalletAndGetAddress, toHexParam, ipfsHashToHex } from 'services/smart-contracts/utils'
import { encrypt } from 'services/crypto/crypto'

const GAS_LIMIT_ACCEPT_BID = 450000

const logTime = (msg, start, end) => {
    console.log(msg + ' ' + (end - start) + ' ms')
}

export const acceptBid = ({ _advertiser, _adunit, _opened, _target, _amount, _timeout = DEFAULT_TIMEOUT, _adslot, v, r, s, _addr, gas, gasPrice }) => {
    return new Promise((resolve, reject) => {

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
}
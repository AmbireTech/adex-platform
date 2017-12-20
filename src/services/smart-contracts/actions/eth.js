import { cfg, exchange, token, web3 } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { toHexParam } from 'services/smart-contracts/utils'
// import { encrypt } from 'services/crypto/crypto'
// import { registerItem } from 'services/smart-contracts/actions'
// import { ItemsTypes } from 'constants/itemsTypes'

export const withdrawEthEstimateGas = ({ _addr, amountToWithdraw, prKey } = {}) => {

    let amount = toHexParam(amountToWithdraw * MULT)

    return new Promise((resolve, reject) => {
        // TODO: 
        resolve(10000)
    })
}

export const withdrawEth = ({ _addr, withdrawTo, amountToWithdraw, prKey } = {}) => {

    let amount = web3.utils.toWei(amountToWithdraw, 'ether')

    return new Promise((resolve, reject) => {
        web3.eth.sendTransaction({
            from: _addr,
            to: withdrawTo,
            value: amount
        })
            .then(function (res) {
                console.log('withdrawEth res', res)
            })
            .catch((err) => {
                console.log('withdrawEth err', err)
                reject(err)
            })
    })
}
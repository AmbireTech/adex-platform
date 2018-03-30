import { cfg, web3Utils, getWeb3 } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { setWalletAndGetAddress, toHexParam, adxAmountStrToHex } from 'services/smart-contracts/utils'
import { encrypt } from 'services/crypto/crypto'
import { registerItem } from 'services/smart-contracts/actions'
import { sendTx } from 'services/smart-contracts/actions/web3'

// TODO: check if that values can be changed
const GAS_LIMIT_APPROVE_0_WHEN_NO_0 = 45136 + 1
// const GAS_LIMIT_APPROVE_0_WHEN_0 = 30136 + 1
const GAS_LIMIT_APPROVE_OVER_0_WHEN_0 = 45821 + 1

const GAS_LIMIT = 450000

// NOTE: We use hrd coded gas values because they are always same 
export const approveTokensEstimateGas = ({ _addr, amountToApprove } = {}) => {
    let amount = adxAmountStrToHex(amountToApprove)

    return new Promise((resolve, reject) => {

        getWeb3().then(({ web3, exchange, token }) => {
            token.methods
                .allowance(_addr, cfg.addr.exchange)
                .call()
                .then((allowance) => {
                    let gas
                    if (adxAmountStrToHex(allowance, true) === amount) {
                        gas = 0 // no need to change or GAS_LIMIT_APPROVE_0_WHEN_0
                    } else if (allowance !== 0) {
                        gas = GAS_LIMIT_APPROVE_0_WHEN_NO_0 + GAS_LIMIT_APPROVE_OVER_0_WHEN_0
                    } else {
                        gas = GAS_LIMIT_APPROVE_OVER_0_WHEN_0
                    }

                    return resolve(gas)
                })
                .catch((err) => {
                    console.log('approveTokensEstimateGas err', err)
                    reject(err)
                })
        })
    })
}

export const approveTokens = ({ _addr, amountToApprove } = {}) => {

    let amount = adxAmountStrToHex(amountToApprove)

    return new Promise((resolve, reject) => {
        // NOTE: to set new approve first set approve to 0
        // https://github.com/OpenZeppelin/zeppelin-solidity/blob/7b9c1429d918a3cf685a1e85fd497d9cc3cf350e/contracts/token/StandardToken.sol#L45

        getWeb3().then(({ web3, exchange, token }) => {
            token.methods
                .allowance(_addr, cfg.addr.exchange)
                .call()
                .then((allowance) => {
                    if (adxAmountStrToHex(allowance, true) === amount) {
                        return false
                    } else if (allowance !== 0) {
                        return token.methods.approve(cfg.addr.exchange, adxAmountStrToHex(0))
                            .send({ from: _addr, gas: GAS_LIMIT_APPROVE_0_WHEN_NO_0 })
                    } else {
                        return true
                    }
                })
                .then((goApprove) => {
                    if (goApprove) {
                        return token.methods.approve(cfg.addr.exchange, amount)
                            .send({ from: _addr, gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 })
                    }

                    return amountToApprove * MULT
                })
                .then((result) => {
                    // TODO: what to return
                    return resolve(!!result)
                })
                .catch((err) => {
                    console.log('token approve err', err)
                    reject(err)
                })
        })
    })
}

export const withdrawAdx = ({ _addr, withdrawTo, amountToWithdraw, gas, gasPrice, user, estimateGasOnly } = {}) => {

    let amount = adxAmountStrToHex(amountToWithdraw)

    return getWeb3(user._authMode.authType)
        .then(({ web3, exchange, token }) => {

            let tx = token.methods.transfer(withdrawTo, amount)

            if(estimateGasOnly) {
                return tx.estimateGas({from: _addr})
            } else {
                return sendTx({
                    web3,
                    tx: tx,
                    opts: { from: _addr, gas, gasPrice },
                    user,
                    txSuccessData: { trMethod: 'TRANS_MTD_ADX_WITHDRAW' }
                })
            }
        })
}
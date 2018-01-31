import { cfg, exchange, token, web3 } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { setWalletAndGetAddress, toHexParam } from 'services/smart-contracts/utils'
import { encrypt } from 'services/crypto/crypto'
import { registerItem } from 'services/smart-contracts/actions'

const toBN = web3.utils.toBN

// TODO: check if that values can be changed
const GAS_LIMIT_APPROVE_0_WHEN_NO_0 = 15136 + 1
// const GAS_LIMIT_APPROVE_0_WHEN_0 = 30136 + 1
const GAS_LIMIT_APPROVE_OVER_0_WHEN_0 = 45821 + 1

const GAS_LIMIT = 450000

// WARNING: hardcoded for now
const adxReward = 200

const getHexAdx = (amountStr, noMultiply) => {
    let am = toBN(amountStr)
    if (!noMultiply) {
        am = am.mul(toBN(MULT))
    }
    let amHex = web3.utils.toHex(am)
    return amHex
}

// NOTE: We use hrd coded gas values because they are always same 
export const approveTokensEstimateGas = ({ _addr, amountToApprove, prKey } = {}) => {
    let amount = getHexAdx(amountToApprove)

    return new Promise((resolve, reject) => {
        token.methods
            .allowance(_addr, cfg.addr.exchange)
            .call()
            .then((allowance) => {
                let gas
                if (getHexAdx(allowance, true) === amount) {
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
}

/**
 * @param {string} _adunitId - adunit ID
 * @param {number} _target - target, in points to be achieved (integer)
 * @param {number} _rewardAmount - reward amount
 * @param {number} _timeout - timeout
 * @param {string} _peer - meta
 * @param {string} prKey - private key
 */
export const approveTokens = ({ _addr, amountToApprove, prKey, gas } = {}) => {

    let amount = getHexAdx(amountToApprove)

    return new Promise((resolve, reject) => {
        // NOTE: to set new approve first set approve to 0
        // https://github.com/OpenZeppelin/zeppelin-solidity/blob/7b9c1429d918a3cf685a1e85fd497d9cc3cf350e/contracts/token/StandardToken.sol#L45
        token.methods
            .allowance(_addr, cfg.addr.exchange)
            .call()
            .then((allowance) => {
                if (getHexAdx(allowance, true) === amount) {
                    return false
                } else if (allowance !== 0) {
                    return token.methods.approve(cfg.addr.exchange, getHexAdx(0))
                        .send({ from: _addr, gas: gas || GAS_LIMIT, gasPrice: GAS_PRICE })
                } else {
                    return true
                }
            })
            .then((goApprove) => {
                if (goApprove) {
                    return token.methods.approve(cfg.addr.exchange, amount)
                        .send({ from: _addr, gas: gas || GAS_LIMIT, gasPrice: GAS_PRICE })
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
}

export const withdrawAdxEstimateGas = ({ _addr, withdrawTo, amountToWithdraw, prKey } = {}) => {

    let amount = getHexAdx(amountToWithdraw)

    return new Promise((resolve, reject) => {
        token.methods
            .transfer(withdrawTo, amount)
            .estimateGas({
                from: _addr,
                // to: withdrawTo,
                // value: amount
            })
            .then(function (res) {
                console.log('withdrawAdxEstimateGas res', res)
                return resolve(res)
            })
            .catch((err) => {
                console.log('withdrawAdxEstimateGas err', err)
                reject(err)
            })
    })
}

export const withdrawAdx = ({ _addr, withdrawTo, amountToWithdraw, prKey, gas } = {}) => {

    let amount = getHexAdx(amountToWithdraw)

    return new Promise((resolve, reject) => {
        token.methods
            .transfer(withdrawTo, amount)
            .send({
                from: _addr,
                gasPrice: GAS_PRICE,
                gas: gas || GAS_LIMIT
            })
            .then(function (res) {
                console.log('withdrawAdx res', res)
                return resolve(res)
            })
            .catch((err) => {
                console.log('withdrawAdx err', err)
                reject(err)
            })
    })
}
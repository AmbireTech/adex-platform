import { cfg, exchange, token, web3 } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { setWalletAndGetAddress, toHexParam } from 'services/smart-contracts/utils'
import { encrypt } from 'services/crypto/crypto'
import { registerItem } from 'services/smart-contracts/actions'
import { ItemsTypes } from 'constants/itemsTypes'

const GAS_LIMIT = 450000

// WARNING: hardcoded for now
const adxReward = 200

/**
 * @param {string} _adunitId - adunit ID
 * @param {number} _target - target, in points to be achieved (integer)
 * @param {number} _rewardAmount - reward amount
 * @param {number} _timeout - timeout
 * @param {string} _peer - meta
 * @param {string} prKey - private key
 */
export const approveTokens = ({ _addr, amountToApprove, prKey } = {}) => {

    let amount = toHexParam(amountToApprove * MULT)

    return new Promise((resolve, reject) => {
        // NOTE: to set new approve first set approve to 0
        // https://github.com/OpenZeppelin/zeppelin-solidity/blob/7b9c1429d918a3cf685a1e85fd497d9cc3cf350e/contracts/token/StandardToken.sol#L45
        token.methods
            .allowance(_addr, cfg.addr.exchange)
            .call()
            .then((allowance) => {
                if (toHexParam(parseFloat(allowance)) === amount) {
                    return false
                } else if (allowance !== 0) {
                    return token.methods.approve(cfg.addr.exchange, 0)
                        .send({ from: _addr, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
                } else {
                    return true
                }
            })
            .then((goApprove) => {
                if (goApprove) {
                    return token.methods.approve(cfg.addr.exchange, amount)
                        .send({ from: _addr, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
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
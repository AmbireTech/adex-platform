import { cfg, exchange, token, web3 } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { setWalletAndGetAddress, toHexParam } from 'services/smart-contracts/utils'
import { encrypt } from 'services/crypto/crypto'

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
export const placeBid = ({ _addr, _adunitId, _target, _rewardAmount, _timeout = DEFAULT_TIMEOUT, _peer, prKey } = {}) => {

    let amount = toHexParam(_rewardAmount * MULT)

    return new Promise((resolve, reject) => {

        /* TODO: setup account 
        *   steps:
        * 0 -   show redirect btn instead creating items and bids
        * 1 -   ask to send eth and adex to account
        * 2 -   register account to adex registry
        * 3 -   approve adex tokens (all or selected by users)
        */

        // token.methods.balanceOf(_addr)
        //     .call()
        //     .then((bal) => {
        //         console.log('bal', bal)
        //     })

        // token.methods.allowance(_addr, cfg.addr.exchange)
        //     .call()
        //     .then((result) => {
        //         console.log('token allowed', result)
        //     })

        // NOTE: to set new approve furst set approve to 0
        // https://github.com/OpenZeppelin/zeppelin-solidity/blob/7b9c1429d918a3cf685a1e85fd497d9cc3cf350e/contracts/token/StandardToken.sol#L45
        // token.methods.approve(cfg.addr.exchange, amount)
        //     .send({ from: _addr, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
        //     .then((result) => {
        //         console.log('token approve @ placeBid', result)
        //     })

        // console.log('token.methods.allowed', token)

        // uint _adunitId, uint _target, uint _rewardAmount, uint _timeout, bytes32 _peer
        return exchange.methods.placeBid(
            toHexParam(_adunitId),
            toHexParam(_target),
            amount,
            toHexParam(_timeout),
            toHexParam(_peer)
        )
            .send({ from: _addr, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
            .then((result) => {
                console.log('placeBid result', result)
                resolve(result)
            })
            .catch((err) => {
                console.log('registerAccount err', err)
                reject(err)
            })
    })
}

/**
 * @param {number} _target - target, in points to be achieved (integer)
 * @param {number} _rewardAmount - reward amount
 * @param {number} _timeout - timeout
 * @param {string} _peer - meta
 * @param {string} prKey - private key
 * @param {string} password - auction password (to encrypt decrypt the price) 
 * TODO: ask the user for auction password and check it somehow for the specific auction
 */
export const placeBidAuction = ({ _target, _rewardAmount = adxReward, _timeout = DEFAULT_TIMEOUT, prKey, password, price, _addr } = {}) => {

    return new Promise((resolve, reject) => {
        //TODO: Remove it
       return resolve('shunted')
    })
}
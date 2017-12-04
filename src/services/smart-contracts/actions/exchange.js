import { cfg, exchange, token } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { getAddrFromPrivateKey, toHexParam } from 'services/smart-contracts/utils'
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
export const placeBid = ({ _adunitId, _target, _rewardAmount, _timeout = DEFAULT_TIMEOUT, _peer, prKey } = {}) => {

    let addr = getAddrFromPrivateKey(prKey)
    let amount = toHexParam(_rewardAmount * MULT)

    return new Promise((resolve, reject) => {
        return token.methods.approve(cfg.addr.exchange, _rewardAmount)
            .send({ from: addr, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
            .then((result) => {
                console.log('token approve @ placeBid', result)

                // uint _adunitId, uint _target, uint _rewardAmount, uint _timeout, bytes32 _peer
                return exchange.methods.placeBid(
                    toHexParam(_adunitId),
                    toHexParam(_target),
                    amount,
                    toHexParam(_timeout),
                    toHexParam(_peer)
                )
                    .send({ from: addr, gas: GAS_LIMIT, gasPrice: GAS_PRICE })
            })
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
 * @param {string} _adunitId - adunit ID
 * @param {number} _target - target, in points to be achieved (integer)
 * @param {number} _rewardAmount - reward amount
 * @param {number} _timeout - timeout
 * @param {string} _peer - meta
 * @param {string} prKey - private key
 * @param {string} password - auction password (to encrypt decrypt the price) 
 * TODO: ask the user for auction password and check it somehow for the specific auction
 */
export const placeBidAuction = ({ _adunitId, _target, _rewardAmount = adxReward, _timeout = DEFAULT_TIMEOUT, _peer, prKey, password, price } = {}) => {

    return new Promise((resolve, reject) => {

        let priceEncrypted = encrypt(price, password)

        if (priceEncrypted.length > 40) {
            return reject('Price too long')
        }

        // _peer for the Ink auction will be used for an encrypted price
        _peer = priceEncrypted

        return placeBid({ _adunitId, _target, _rewardAmount, _timeout, _peer, prKey })
    })
}
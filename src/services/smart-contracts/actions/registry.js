import { registry } from 'services/smart-contracts/ADX'
import { GAS_PRICE } from 'services/smart-contracts/constants'
import { toHexParam } from 'services/smart-contracts/utils'

const GAS_LIMIT_REGISTER_ACCOUNT = 150000
const GAS_LIMIT_REGISTER_ITEM = 180000

// NOTE: Actions accepts decoded to ascii string values from models

/**
 * can be called over and over to update the data
 * @param {string} _name - name
 * @param {string} _wallet - (eth address) wallet
 * @param {string} _ipfs - ipfs hash
 * @param {string} _sig - signature
 * @param {string} _meta - meta
 * @param {string} prKey - account private key (optional)
 */
export const registerAccount = ({ _addr, _name = '', _wallet = 0, _ipfs = 0, _sig = 0, _meta = {}, prKey } = {}) => {

    // TODO: fix prKey and addr flow
    // NOTE: Temp addr is provide because in development mode the address and the private Key of eb3 wallet does not match

    _name = _name || 'no-name'

    return new Promise((resolve, reject) => {
        registry.methods.register(
            toHexParam(_name),
            _addr, //_wallet,
            toHexParam(_ipfs),
            toHexParam(_sig),
            toHexParam(_meta)
        )
            .send({ from: _addr, gas: GAS_LIMIT_REGISTER_ACCOUNT, gasPrice: GAS_PRICE })
            .then((result) => {
                console.log('registerAccount result', result)
                resolve(result)
            })
            .catch((err) => {
                console.log('registerAccount err', err)
                reject(err)
            })
    })
}

/**
 * use _id = 0 to create a new item, otherwise modify existing
 * @param {number} _type - type (integer) 
 * @param {number} _id - id (integer)
 * @param {string} _ipfs - ipfs hash
 * @param {string} _name - name
 * @param {string} _meta - meta
 */
export const registerItem = ({ _type, _id, _ipfs, _name, _meta, prKey, _addr } = {}) => {

    return new Promise((resolve, reject) => {

        registry.methods
            .registerItem(
            toHexParam(_type),
            toHexParam(_id),
            toHexParam(_ipfs),
            toHexParam(_name),
            toHexParam(_meta)
            )
            .call({ from: _addr, gas: GAS_LIMIT_REGISTER_ITEM, gasPrice: GAS_PRICE })
            .then((result) => {
                console.log('registerItem result', result)
                resolve(result)
            })
            .catch((err) => {
                console.log('registerItem err', err)
                reject(err)
            })
    })
}
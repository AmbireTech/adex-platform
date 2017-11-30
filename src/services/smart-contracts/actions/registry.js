import { web3, registry } from 'services/smart-contracts/ADX'

const web3Utils = web3.utils

// NOTE: Actions accepts decoded to ascii string values from models

/**
 * can be called over and over to update the data
 * @param {string} _name - name
 * @param {string} _wallet - (eth address) wallet
 * @param {string} _ipfs - ipfs hash
 * @param {string} _sig - signature
 * @param {string} _meta - meta
 */
export const registerAccount = ({ _name, _wallet, _ipfs, _sig, _meta } = {}) => {
    return new Promise((resolve, reject) => {
        registry.methods
            .register(web3Utils.fromAscii(_name), _wallet, web3Utils.fromAscii(_ipfs), _sig, web3Utils.fromAscii(_meta))
            .call()
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
export const registerItem = ({ _type, _id, _ipfs, _name, _meta } = {}) => {
    return new Promise((resolve, reject) => {
        registry.methods
            .registerItem(_type, _id, web3Utils.fromAscii(_ipfs), web3Utils.fromAscii(_name), web3Utils.fromAscii(_meta))
            .call()
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
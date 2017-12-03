import { web3, registry } from 'services/smart-contracts/ADX'

const web3Utils = web3.utils
const TO_HEX_PAD_LEFT = 40
const GAS_LIMIT_REGISTER_ACCOUNT = 150000
const GAS_LIMIT_REGISTER_ITEM = 180000
const GAS_PRICE = 3299515020

// NOTE: Actions accepts decoded to ascii string values from models

/**
 * TODO: consider how to do it - keep the account in the web3 obj global obj or create it here on every action
 * and ask for password do decrypt he private key
 */
const getAddrFromPrivateKey = (prKey) => {
    let addr
    let wallet = web3.eth.accounts.wallet
    if (prKey) {
        let acc = web3.eth.accounts.privateKeyToAccount(prKey)
        wallet.add(acc)
    }

    // TODO: handle err
    addr = wallet[0].address

    return addr
}

const toHexParam = (param) => {
    return web3Utils.padLeft(web3Utils.toHex(param), TO_HEX_PAD_LEFT)
}

/**
 * can be called over and over to update the data
 * @param {string} _name - name
 * @param {string} _wallet - (eth address) wallet
 * @param {string} _ipfs - ipfs hash
 * @param {string} _sig - signature
 * @param {string} _meta - meta
 * @param {string} prKey - account private key (optional)
 */
export const registerAccount = ({ _name, _wallet, _ipfs, _sig, _meta, prKey } = {}) => {

    let addr = getAddrFromPrivateKey(prKey)

    return new Promise((resolve, reject) => {
        registry.methods.register(
            toHexParam(_name),
            _wallet,
            toHexParam(_ipfs),
            toHexParam(_sig),
            toHexParam(_meta)
        )
            .send({ from: addr, gas: GAS_LIMIT_REGISTER_ACCOUNT, gasPrice: GAS_PRICE })
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
export const registerItem = ({ _type, _id, _ipfs, _name, _meta, prKey } = {}) => {

    let addr = getAddrFromPrivateKey(prKey)

    return new Promise((resolve, reject) => {

        registry.methods
            .registerItem(
            toHexParam(_type),
            toHexParam(_id),
            toHexParam(_ipfs),
            toHexParam(_name),
            toHexParam(_meta)
            )
            .call({ from: addr, gas: GAS_LIMIT_REGISTER_ITEM, gasPrice: GAS_PRICE })
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
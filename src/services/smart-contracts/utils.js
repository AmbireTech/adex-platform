import { web3 } from 'services/smart-contracts/ADX'
import { TO_HEX_PAD_LEFT } from 'services/smart-contracts/constants'

const web3Utils = web3.utils

/**
 * TODO: consider how to do it - keep the account in the web3 obj global obj or create it here on every action
 * and ask for password do decrypt he private key
 */
export const getAddrFromPrivateKey = (prKey) => {
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

export const toHexParam = (param) => {
    return web3Utils.padLeft(web3Utils.toHex(param), TO_HEX_PAD_LEFT)
}
import { web3 } from 'services/smart-contracts/ADX'
import { TO_HEX_PAD } from 'services/smart-contracts/constants'

const web3Utils = web3.utils

// TODO: decide to use this func or set specific params for the specific params
export const toHexParam = (param) => {

    let pad

    if (typeof param === 'number') {
        pad = web3Utils.padLeft
    } else {
        pad = web3Utils.padRight
    }

    let hexValue = pad(web3Utils.toHex(param), TO_HEX_PAD)

    // console.log('hexValue param', param)
    // console.log('hexValue', hexValue)

    return hexValue
}
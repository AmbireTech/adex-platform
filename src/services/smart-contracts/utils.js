import { web3Utils } from 'services/smart-contracts/ADX'
import { TO_HEX_PAD, MULT, PRECISION } from 'services/smart-contracts/constants'
import bs58 from 'bs58'
import { Exception } from 'handlebars';

const { toBN, toHex, hexToNumber, hexToUtf8, padLeft, padRight } = web3Utils
const IPFS_BASE_58_LEADING = '1220'
// NOTE: maybe it shoud work with .32
const CHECK_NUMBER_STR = new RegExp(/^([0-9]+\.?[0-9]*)$/)

// TODO: decide to use this func or set specific params for the specific params
export const toHexParam = (param) => {

    let pad

    if (typeof param === 'number') {
        pad = padLeft
    } else {
        pad = padRight
    }

    const hexValue = pad(toHex(param), TO_HEX_PAD)

    // console.log('hexValue param', param)
    // console.log('hexValue', hexValue)

    return hexValue
}

export const fromHexParam = (param, type) => {
    let decoded = param

    // TEMP: in some cases hexToUtf8 throws Invalid UTF-8 detected ...
    try {
        if (type === 'number') {
            decoded = hexToNumber(param)
        } else if (type === 'string') {
            decoded = hexToUtf8(param)
        }
    } catch (err) {
        console.log('fromHexParam err', err)
    }
    finally {
        return decoded
    }
}

// NOTE: converts user input string to multiplied integer
export const adxAmountStrToHex = (amountStr) => {
    amountStr = amountStr.toString() // OR throw if no string

    let isValid = validAmountStr(amountStr)

    if (!isValid) throw new Exception('Invalid amount string!')

    let amParts = amountStr.split('.') //In no "." all goes to ints 
    let ints = amParts[0]
    let floats = amParts[1] || '0'
    floats = floats.substr(0, PRECISION) // Cuts the digits after the precision
    floats = padRight(floats, PRECISION) // Ensures precision

    let amount = ints + floats

    return toHex(amount)
}

const validAmountStr = (amountStr) => {
    // TODO: maybe more strict test
    let isValid = CHECK_NUMBER_STR.test(amountStr)
    return isValid
}
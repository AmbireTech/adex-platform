import { web3Utils } from 'services/smart-contracts/ADX'
import { TO_HEX_PAD, MULT, PRECISION } from 'services/smart-contracts/constants'
import bs58 from 'bs58'
import { Exception } from 'handlebars';

const { toBN, toHex, hexToNumber, hexToUtf8, padLeft, padRight } = web3Utils
const IPFS_BASE_58_LEADING = '1220'

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

// NOTE: maybe it shoud work with .32
const CHECK_NUMBER_STR = new RegExp(/^([0-9]+\.?[0-9]*)$/)
const LEADING_ZEROS = /^0+/
// NOTE: converts user input string to multiplied integer
// TODO: more tests for this
export const adxAmountStrToPrecision = (amountStr) => {
    amountStr = amountStr.toString() // OR throw if no string

    const isValid = validAmountStr(amountStr)

    if (!isValid) throw new Exception('Invalid amount string!')

    const amParts = amountStr.split('.') //In no "." all goes to ints 
    const ints = amParts[0]
    const floats = amParts[1] || '0'
    const floatsToPrecision = floats.substr(0, PRECISION) // Cuts the digits after the precision
    const floatsEnsuredPrecision = padRight(floatsToPrecision, PRECISION) // Ensures precision

    const amount = ints + floatsEnsuredPrecision

    const amountNoLeadingZeros = amount.replace(LEADING_ZEROS, '')

    return amountNoLeadingZeros || '0'
}

export const adxAmountStrToHex = (amountStr) => {
    let amount = !!amountStr && adxAmountStrToPrecision(amountStr)

    return toHex(amount)
}

export const validAmountStr = (amountStr) => {
    // TODO: maybe more strict test
    let isValid = CHECK_NUMBER_STR.test(amountStr)
    return isValid
}

export const adxToFloatView = (adxAmountStr) => {
    let floatAmount = parseInt(adxAmountStr, 10) / MULT
    return floatAmount.toFixed(4)
}
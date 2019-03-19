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
export const tokenAmountStrToPrecision = (amountStr, precision) => {
	amountStr = amountStr.toString() // OR throw if no string

	const isValid = validAmountStr(amountStr)

	if (!isValid) throw new Exception('Invalid amount string!')

	const amParts = amountStr.split('.') //In no "." all goes to ints 
	const ints = amParts[0]
	const floats = amParts[1] || '0'
	const floatsToPrecision = floats.substr(0, precision) // Cuts the digits after the precision
	const floatsEnsuredPrecision = padRight(floatsToPrecision, precision) // Ensures precision

	const amount = ints + floatsEnsuredPrecision

	const amountNoLeadingZeros = amount.replace(LEADING_ZEROS, '')

	return amountNoLeadingZeros || '0'
}

/**
 * @deprecated Use tokenAmountStrToPrecision(amountStr, precision)
 */
export const adxAmountStrToPrecision = (amountStr) => {
	return tokenAmountStrToPrecision(amountStr, PRECISION)
}

export const tokenAmountStrToHex = (amountStr, precision) => {
	let amount = !!amountStr && tokenAmountStrToPrecision(amountStr, precision)

	return toHex(amount)
}

/**
 * @deprecated Use tokenAmountStrToHex(amountStr, precision)
 */
export const adxAmountStrToHex = (amountStr) => {
	return tokenAmountStrToHex(amountStr, PRECISION)
}

export const validAmountStr = (amountStr) => {
	// TODO: maybe more strict test
	let isValid = CHECK_NUMBER_STR.test(amountStr)
	return isValid
}

export const tokenToFloatView = (tokenAmountStr, precision) => {
	let floatAmount = parseInt(tokenAmountStr, 10) / Math.pow(10, precision)
	return floatAmount.toFixed(4)
}

/**
 * @deprecated Use tokenToFloatView(tokenAmountStr, precision)
 */
export const adxToFloatView = (adxAmountStr) => {
	return tokenToFloatView(adxAmountStr, PRECISION)
}

export const getRsvFromSig = (sig) => {
	sig = sig.slice(2)

	var r = '0x' + sig.substring(0, 64)
	var s = '0x' + sig.substring(64, 128)
	var v = parseInt(sig.substring(128, 130), 16)

	return { r: r, s: s, v: v }
}

// NOTE: works with typed data in format {type: 'solidity data type', name: 'string (label)', value: 'preferable string'} 
export const getTypedDataHash = ({ typedData }) => {
	let values = typedData.map((entry) => {
		return entry.value // ? .toString().toLowerCase()
	})
	let valuesHash = web3Utils.soliditySha3.apply(null, values)

	let schema = typedData.map((entry) => { return entry.type + ' ' + entry.name })
	let schemaHash = web3Utils.soliditySha3.apply(null, schema)

	let hash = web3Utils.soliditySha3(schemaHash, valuesHash)

	return hash
}
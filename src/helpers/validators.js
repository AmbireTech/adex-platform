import { utils } from 'ethers'
import { isEthAddressERC20, isConnectionLost } from '../services/smart-contracts/actions/erc20';

/*eslint-disable */
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const onlyDigitsRegex = /^([1-9]+\d*)$/
// Min 8 chars - at least 1 uppercase, 1 lowercase, 1 digit
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/
const couponRegex = /^[a-fA-F0-9]{8}$/
/*eslint-enable */


export const validUrl = (url) => {
	url = url || ''
	const isValid = urlRegex.test(url)
	return isValid
}

export const validEmail = (email) => {
	email = email || ''
	const isValid = emailRegex.test(email)
	return isValid
}

export const validateNumber = (numberStr) => {
	numberStr = numberStr || ''
	const isValid = !isNaN(parseFloat(numberStr)) && isFinite(numberStr) && (numberStr > 0)
	return isValid
}

// > 0
export const validPositiveInt = (intStr) => {
	intStr = intStr || ''
	const isValid = onlyDigitsRegex.test(intStr)
	return isValid
}

export const validName = (name) => {
	let msg = ''
	const errMsgArgs = []
	if (!name) {
		msg = 'ERR_REQUIRED_FIELD'
	} else if (name.length < 4) {
		msg = 'ERR_MIN_LENGTH'
		errMsgArgs.push(4)
	} else if (name.length > 128) {
		msg = 'ERR_MAX_LENGTH'
		errMsgArgs.push(128)
	}

	return {
		msg,
		errMsgArgs
	}
}

export const validPassword = (password) => {
	password = password || ''
	const isValid = passwordRegex.test(password)
	return isValid
}

export const validQuickAccountCoupon = (coupon) => {
	coupon = coupon || ''
	const isValid = couponRegex.test(coupon)
	return isValid
}

export const isEthAddress = (addr = '') => {
	try {
		utils.getAddress(addr)
	} catch (e) {
		return false
	}
	return true
}

export const isEthAddressZero = (addr = '') => {
	return isEthAddress(addr)
		? utils.bigNumberify(utils.getAddress(addr)).isZero()
		: false;
}

export const validEthAddress = async ({ addr = '', nonZeroAddr, nonERC20 }) => {
	try {
		let msg = ''
		if (!isEthAddress(addr))
			msg = 'ERR_INVALID_ETH_ADDRESS'
		if (nonZeroAddr && isEthAddressZero(addr))
			msg = 'ERR_INVALID_ETH_ADDRESS_ZERO'
		if (nonERC20 && await isEthAddressERC20(addr))
			msg = 'ERR_INVALID_ETH_ADDRESS_TOKEN'
		if (await isConnectionLost(addr))
			msg = "ERR_INVALID_CONNECTION_LOST"
		return { msg }
	} catch (error) {
		console.log(error);
		return { msg: error.message }
	}
}
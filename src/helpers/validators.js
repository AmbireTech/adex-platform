import { ethers, utils, constants } from 'ethers'
import { getEthers } from '../services/smart-contracts/ethers';

/*eslint-disable */
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
const onlyDigitsRegex = /^([1-9]+\d*)$/
// Min 8 chars - at least 1 uppercase, 1 lowercase, 1 digit
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/
const couponRegex = /^[a-fA-F0-9]{8}$/
const ERC20TokenABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }];
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

export const isEthAddressZero = (addr) => {
	return isEthAddress(addr)
		? utils.bigNumberify(addr).isZero()
		: false;
}

export const isEthAddressERC20 = async (addr) => {
	try {
		if (isEthAddress(addr)) {
			const eth = await getEthers()
			const contract = new ethers.Contract(addr, ERC20TokenABI, eth.provider)
			await contract.totalSupply()
			await contract.balanceOf(constants.AddressZero)
			await contract.allowance(constants.AddressZero, constants.AddressZero)
			return true
		}
		return false
	} catch (error) {
		return false
	}
}
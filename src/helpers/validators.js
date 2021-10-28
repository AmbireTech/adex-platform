import { utils } from 'ethers'
import { isEthAddressERC20 } from 'services/smart-contracts/actions/erc20'
import { isConnectionLost } from 'services/smart-contracts/actions/common'
import { getEthersReadOnly } from 'services/smart-contracts/ethers'

const ipfsRegex = /(ipfs):\/\/(.){46}?$/
// const ipfsIdRegex = /^Qm[a-zA-z0-9]{44}$/
// const addressRegex = /^0x[0-9A-Fa-f]{40}$/
// const signatureRegex = /^0x[0-9A-Fa-f]{130}$/
// const hashRegex = /^0x[0-9A-Fa-f]{64}$/
const numberStringRegex = /^([0-9]+\.?[0-9]*)$/
const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

/*eslint-disable */
const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
const onlyDigitsRegex = /^([1-9]+\d*)$/
// Min 8 chars - at least 1 uppercase, 1 lowercase, 1 digit
const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$/
/*eslint-enable */

export const validUrl = url => {
	url = url || ''
	const isValid = urlRegex.test(url)
	return isValid
}

export const validateNumber = numberStr => {
	numberStr = numberStr || ''
	const isValid =
		!isNaN(parseFloat(numberStr)) && isFinite(numberStr) && numberStr > 0
	return isValid
}

// > 0
export const validPositiveInt = intStr => {
	intStr = intStr || ''
	const isValid = onlyDigitsRegex.test(intStr)
	return isValid
}

export const validPassword = password => {
	password = password || ''
	const isValid = passwordRegex.test(password)
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
		? utils.BigNumber.from(utils.getAddress(addr)).isZero()
		: false
}

export const validEthAddress = async ({
	addr = '',
	nonZeroAddr,
	nonERC20,
	authType,
	quickCheck = false,
}) => {
	let msg = ''
	try {
		const notEthAddress = !addr || !isEthAddress(addr)
		if (notEthAddress) {
			msg = 'ERR_INVALID_ETH_ADDRESS'
		} else if (!quickCheck) {
			const ethAddressZero = isEthAddressZero(addr)
			if (nonZeroAddr && ethAddressZero) {
				msg = 'ERR_INVALID_ETH_ADDRESS_ZERO'
			} else {
				const connectionLost = await isConnectionLost(authType)
				if (connectionLost) {
					msg = 'ERR_INVALID_CONNECTION_LOST'
				} else {
					const ethAddressERC20 = await isEthAddressERC20(addr)
					if (!ethAddressZero && nonERC20 && ethAddressERC20)
						msg = 'ERR_INVALID_ETH_ADDRESS_TOKEN'
				}
			}
		}
	} catch (error) {
		if (error === 'Non-Ethereum browser detected.')
			msg = 'ERR_INVALID_CONNECTION_LOST'
	}
	return { msg }
}

export const freeAdExENS = async ({ username = '' }) => {
	let msg = ''
	try {
		if (username === '') {
			msg = 'ERR_ENS_REQUIRED'
		} else {
			const { provider } = await getEthersReadOnly()
			const ensAddress = await provider.resolveName(
				`${username}.${process.env.REVERSE_REGISTRAR_PARENT}`
			)

			if (ensAddress && !isEthAddressZero(ensAddress)) msg = 'ERR_ENS_NOT_FREE'
		}
	} catch (error) {
		if (error.code === 'INVALID_ARGUMENT') {
			msg = 'ERR_INVALID_ARGUMENT_ENS'
		} else {
			msg = 'ERR_ENS_CHECK'
		}
	}
	return { msg }
}

export function isNumberString(str) {
	const isValid = numberStringRegex.test(str)
	return isValid
}

export function isValidEmail(str) {
	const isValid = emailRegex.test(str)
	return isValid
}

export function isValidIPFS(str) {
	const isValid = ipfsRegex.test(str)
	return isValid
}

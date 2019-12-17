import { ethers, utils } from 'ethers'
import pbkdf2 from 'pbkdf2'
import {
	encrypt,
	decrypt,
	encryptLegacy,
	decryptLegacy,
} from 'services/crypto/crypto'
import {
	loadFromLocalStorage,
	saveToLocalStorage,
	getKeys,
	removeFromLocalStorage,
} from 'helpers/localStorageHelpers'
import { AUTH_TYPES } from 'constants/misc'

function getCipherKey({ email, password }) {
	const pass = generateSalt(password)
	const salt = generateSalt(email)

	const key = pbkdf2.pbkdf2Sync(pass, salt, 10000, 64, 'sha512').toString('hex')

	return key
}

function wEncrypt({ email, password, data, isLegacy }) {
	const jsonData = JSON.stringify(data)
	if (isLegacy) {
		return encryptLegacy(jsonData, email + password)
	} else {
		return encrypt(jsonData, getCipherKey({ email, password }))
	}
}

function wDecrypt({ email, password, data, isLegacy }) {
	let decryptedStr = ''
	if (isLegacy) {
		decryptedStr = decryptLegacy(data, email + password)
	} else {
		decryptedStr = decrypt(data, getCipherKey({ email, password }))
	}

	try {
		const decr = JSON.parse(decryptedStr)
		return decr
	} catch (err) {
		throw new Error('INVALID_PASSWORD_OR_EMAIL', err)
	}
}

// Returns 12 random words
export function getRandomMnemonic() {
	const randomEntropy = utils.randomBytes(16)
	const mnemonic = utils.HDNode.entropyToMnemonic(randomEntropy)

	return mnemonic
}

export function generateWallet(mnemonic) {
	const seed = mnemonic || getRandomMnemonic()
	const wallet = ethers.Wallet.fromMnemonic(seed)

	return {
		mnemonic,
		privateKey: wallet.privateKey,
		address: wallet.address,
		path: wallet.path,
	}
}

function encrKey({ email, password, authType }) {
	if (!authType) {
		return encryptLegacy(email, password)
	} else if (typeof authType === 'string') {
		return `adex-${authType}-wallet-${email}`
	} else {
		throw new Error('INVALID_TYPE')
	}
}

export function encrData({ email, password, data }) {
	const encr = wEncrypt({ data: JSON.stringify(data), email, password })
	return encr
}

export function decrData({ email, password, data }) {
	const decryptedStr = wDecrypt({ data, email, password })
	try {
		const decr = JSON.parse(decryptedStr)
		return decr
	} catch (err) {
		throw new Error('INVALID_PASSWORD_OR_EMAIL', err)
	}
}

export function createLocalWallet({
	email = '',
	password = '',
	mnemonic = '',
	authType = '',
}) {
	const walletData = generateWallet(mnemonic)
	const key = encrKey({ email, password, authType })
	const data = encrData({ data: walletData, email, password })
	saveToLocalStorage({ data }, key)

	walletData.authType = authType
	return walletData
}

export function migrateLegacyWallet({ email = '', password = '' }) {
	const wallet = getLocalWallet({
		email,
		password,
		getEncrypted: true,
	})

	if (wallet && wallet.data) {
		const newKey = encrKey({ email, password, authType: AUTH_TYPES.GRANT.name })
		saveToLocalStorage(wallet, newKey)
	}
}

export function removeLegacyKey({ email = '', password = '' }) {
	const key = encrKey({ email, password })
	removeFromLocalStorage(key)
}

export function addDataToWallet({
	email = '',
	password = '',
	dataKey = '',
	dataValue = '',
	authType,
}) {
	if (dataKey === 'data') {
		throw new Error('INVALID_DATA_KEY')
	}

	const key = encrKey({ email, password, authType })
	const wallet = loadFromLocalStorage(key)

	if (!wallet) {
		throw new Error('WALLET_NOT_FOUND')
	}

	const data = encrData({ data: dataValue, email, password })
	wallet[dataKey] = data
	saveToLocalStorage(wallet, key)
}

export function getRecoveryWalletData({ email, password, authType }) {
	if (!email || !password) {
		return null
	}

	const key = encrKey({ email, password, authType })
	const wallet = loadFromLocalStorage(key)

	return {
		key,
		wallet,
	}
}

export function getLocalWallet({ email, password, authType, getEncrypted }) {
	if (!email || !password) {
		throw new Error('REQUIRED_EMAIL_AND_PASSWORD')
	}

	const key = encrKey({ email, password, authType })
	const wallet = loadFromLocalStorage(key)

	if (wallet) {
		if (getEncrypted) {
			return wallet
		}

		const data = Object.keys(wallet).reduce((props, key) => {
			props[key] = decrData({
				data: wallet[key],
				email,
				password,
			})

			return props
		}, {})

		return data
	} else {
		return null
	}
}

function isWallet(item) {
	return item && item.data && item.identity && item.privileges
}

export function walletInfo(key, index, wallet) {
	const split = key.split('-')
	const mail = split.length >= 3 ? split.slice(3, split.length).join('-') : null
	const authType = split[1] || 'legacy'
	const name = mail || `Grant account # ${index + 1}`

	const info = {
		key,
		wallet,
		name,
		authType,
	}

	return info
}

export function getAllWallets() {
	const walletKeys = getKeys()
		.map(key => {
			return {
				key,
				item: loadFromLocalStorage(key),
			}
		})
		.filter(({ item }) => isWallet(item))
		.map(({ item, key }, index) => walletInfo(key, index, item))

	return walletKeys
}

export function getWalletHash({ salt, password }) {
	const passwordId = utils.id(password)

	const hash = pbkdf2
		.pbkdf2Sync(passwordId, salt, 10000, 64, 'sha512')
		.toString('hex')

	return hash
}

export function generateSalt(dataStr) {
	if (typeof dataStr !== 'string') {
		throw new Error('ERR_GEN_SALT_INPUT_NOT_STR')
	} else if (!dataStr.length) {
		throw new Error('ERR_GEN_SALT_INPUT_TOO_SHORT')
	}

	const id = utils.id(dataStr)
	const salt = utils.keccak256(id)
	return salt
}

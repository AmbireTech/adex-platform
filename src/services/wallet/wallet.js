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

function pbkdf2Async(pass, salt, iterations, keylen, digiset, encoding) {
	return new Promise((resolve, reject) => {
		pbkdf2.pbkdf2(
			pass,
			salt,
			iterations,
			keylen,
			digiset,
			(err, derivedKey) => {
				if (err) {
					return reject(err)
				}

				const res = derivedKey.toString(encoding)

				return resolve(res)
			}
		)
	})
}

async function getCipherKey({ email, password }) {
	const pass = generateSalt(password)
	const salt = generateSalt(email)

	const key = await pbkdf2Async(pass, salt, 10000, 64, 'sha512', 'hex')

	return key
}

function isLegacyCrypto(authType) {
	return !authType || authType === 'legacy' || authType === 'grant'
}

// Returns 12 random words
export function getRandomMnemonic() {
	const randomEntropy = utils.randomBytes(16)
	const mnemonic = utils.entropyToMnemonic(randomEntropy)

	return mnemonic
}

export async function generateWallet(mnemonic) {
	const seed = mnemonic || getRandomMnemonic()
	const wallet = ethers.Wallet.fromMnemonic(seed)

	const walletData = {
		mnemonic: wallet.mnemonic.phrase,
		privateKey: wallet.privateKey,
		address: wallet.address,
		path: wallet.mnemonic.path,
	}

	return walletData
}

async function encrKey({ email, password, authType }) {
	if (!authType) {
		return await encryptLegacy(email, password)
	} else if (typeof authType === 'string') {
		return `adex-${authType}-wallet-${email.toLowerCase()}`
	} else {
		throw new Error('INVALID_TYPE')
	}
}

export async function encrData({ email = '', password, data, authType }) {
	const isLegacy = isLegacyCrypto(authType)
	const jsonData = JSON.stringify(data)
	if (isLegacy) {
		const legacyEncrypted = await encryptLegacy(jsonData, email + password)
		return legacyEncrypted
	} else {
		const encrypted = await encrypt(
			jsonData,
			await getCipherKey({ email: email.toLowerCase(), password })
		)
		return encrypted
	}
}

export async function decrData({ email = '', password, data, authType }) {
	let decryptedStr = ''
	const isLegacy = isLegacyCrypto(authType)

	if (isLegacy) {
		decryptedStr = await decryptLegacy(data, email + password)
	} else {
		decryptedStr = await decrypt(
			data,
			await getCipherKey({ email: email.toLowerCase(), password })
		)
	}

	try {
		const decr = JSON.parse(decryptedStr)
		return decr
	} catch (err) {
		throw new Error('INVALID_PASSWORD_OR_EMAIL', err)
	}
}

export async function createLocalWallet({
	email = '',
	password = '',
	mnemonic,
	authType = '',
}) {
	const walletData = await generateWallet(mnemonic)
	const key = await encrKey({ email, password, authType })
	const data = await encrData({ data: walletData, email, password, authType })
	await saveToLocalStorage({ data }, key)

	walletData.authType = authType
	return walletData
}

export async function migrateLegacyWallet({ email = '', password = '' }) {
	const wallet = await getLocalWallet({
		email,
		password,
		getEncrypted: true,
	})

	if (wallet && wallet.data) {
		const newKey = await encrKey({
			email,
			password,
			authType: AUTH_TYPES.GRANT.name,
		})
		saveToLocalStorage(wallet, newKey)
	}
}

export async function removeLegacyKey({ email = '', password = '' }) {
	const key = await encrKey({ email, password })
	removeFromLocalStorage(key)
}

export async function addDataToWallet({
	email = '',
	password = '',
	dataKey = '',
	dataValue = '',
	authType,
}) {
	if (dataKey === 'data') {
		throw new Error('INVALID_DATA_KEY')
	}

	const key = await encrKey({ email, password, authType })
	const wallet = loadFromLocalStorage(key)

	if (!wallet) {
		throw new Error('WALLET_NOT_FOUND')
	}

	const data = await encrData({ data: dataValue, email, password, authType })
	wallet[dataKey] = data
	saveToLocalStorage(wallet, key)
}

export async function getRecoveryWalletData({ email, password, authType }) {
	if (!email || !password) {
		return null
	}

	const key = await encrKey({ email, password, authType })
	const wallet = loadFromLocalStorage(key)

	return {
		key,
		wallet,
	}
}

export async function getLocalWallet({
	email,
	password,
	authType,
	getEncrypted,
}) {
	if (!email || !password) {
		throw new Error('REQUIRED_EMAIL_AND_PASSWORD')
	}

	const key = await encrKey({ email, password, authType })
	const wallet = loadFromLocalStorage(key)

	if (wallet) {
		if (getEncrypted) {
			return wallet
		}

		const walletKeys = Object.keys(wallet)

		const decrypts = walletKeys.map(async key => {
			// props[key] = await decrData({
			// 	data: wallet[key],
			// 	email,
			// 	password,
			// 	authType,
			// })

			const decryptedData = await decrData({
				data: wallet[key],
				email,
				password,
				authType,
			})

			return decryptedData
		})

		const decryptedData = await Promise.all(decrypts)

		const decryptedWallet = walletKeys.reduce((props, key, index) => {
			props[key] = decryptedData[index]
			return props
		}, {})

		return decryptedWallet
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

export async function getWalletHash({ salt, password }) {
	const passwordId = utils.id(password)

	const hash = await pbkdf2Async(passwordId, salt, 10000, 64, 'sha512', 'hex')

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

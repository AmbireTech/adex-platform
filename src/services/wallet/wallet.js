import { ethers, utils } from 'ethers'
import { encrypt, decrypt } from 'services/crypto/crypto'
import { loadFromLocalStorage, saveToLocalStorage, getKeys } from 'helpers/localStorageHelpers'

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
		path: wallet.path
	}
}

function encrKey({ email, password }) {
	const key = encrypt(email, password)
	return key
}

function encrData({ email, password, data }) {
	const encr = encrypt(JSON.stringify(data), email + password)
	return encr
}

function decrData({ email, password, data }) {
	const decr = JSON.parse(decrypt(data, email + password))
	return decr
}

export function createLocalWallet({ email = '', password = '', mnemonic = '' }) {
	const walletData = generateWallet(mnemonic)
	const key = encrKey({ email, password })
	const data = encrData({ data: walletData, email, password })
	saveToLocalStorage({ data }, key)

	return walletData
}

export function rewriteLegacyWallet({ email = '', password = '', wallet}) {
	
}

export function addDataToWallet({
	email = '',
	password = '',
	dataKey = '',
	dataValue = '' }) {
	if (dataKey === 'data') {
		throw new Error('Invalid data key')
	}

	const key = encrKey({ email, password })
	const wallet = loadFromLocalStorage(key)

	if (!wallet) {
		throw new Error('Wallet not found')
	}

	const data = encrData({ data: dataValue, email, password })
	wallet[dataKey] = data
	saveToLocalStorage(wallet, key)
}

export function getRecoveryWalletData({ email, password }) {
	if (!email || !password) {
		return null
	}

	const key = encrKey({ email, password })
	const wallet = loadFromLocalStorage(key)

	return {
		key,
		wallet
	}
}

export function getLocalWallet({ email, password }) {
	if (!email || !password) {
		throw new Error('email and password are required')
	}

	const key = encrKey({ email, password })
	const wallet = loadFromLocalStorage(key)

	if (wallet) {
		const data = Object.keys(wallet)
			.reduce((props, key) => {
				props[key] = decrData({
					data: wallet[key],
					email,
					password
				})

				return props
			}, {})

		return data
	} else {
		return null
	}
}

function isWallet(item) {
	return item
		&& item.data
		&& item.identity
		&& item.privileges
}

function walletInfo(key, index, wallet) {
	const split = key.split('-')
	const mail = split[1]
	const type = mail ? 'quick' : 'grant'
	const name = mail || `Grant account # ${index + 1}`

	const info = {
		key,
		wallet,
		name,
		type
	}

	return info
}

export function getAllWallets() {
	const walletKeys = getKeys()
		.map(key => {
			return {
				key,
				item: loadFromLocalStorage(key)
			}
		})
		.filter(({ item }) => isWallet(item))
		.map(({ item, key }, index) => walletInfo(key, index, item))

	return walletKeys
}
import { ethers, utils, Wallet } from 'ethers'
import { encrypt, decrypt } from 'services/crypto/crypto'
import { loadFromLocalStorage, saveToLocalStorage } from 'helpers/localStorageHelpers'

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

export function createLocalWallet({ email = '', password = '', mnemonic = '' }) {
	const walletData = generateWallet(mnemonic)
	const data = JSON.stringify(walletData)
	const encrKey = encrypt(email, password)
	const encrData = encrypt(data, email + password)
	saveToLocalStorage({ data: encrData }, encrKey)

	return walletData
}

export function getLocalWallet({ email, password }) {
	const key = encrypt(email, password)
	const data = loadFromLocalStorage(key)
	if (data) {
		const decrData = decrypt(data.data, email + password)
		const walletData = JSON.parse(decrData)
		return walletData
	} else {
		return null
	}
}
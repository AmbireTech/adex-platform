// Nodejs encryption with CTR
const crypto = require('crypto')

const CIPHER_LEGACY_ALG = 'aes-256-ctr'
const CIPHER_ALG = 'aes-256-cbc'
const IV_LENGTH = 16
const HASH_ALG = 'sha256'

const getKeyHash = key => {
	const hash = crypto.createHash(HASH_ALG)
	hash.update(key)
	const hashed = hash.digest()
	return hashed
}

export const encrypt = (text, key) => {
	if (!text) return ''
	if (!key) {
		throw new Error('ERR_ENCRYPTING_NO_PASS')
	}
	const iv = crypto.randomBytes(IV_LENGTH)
	const cipher = crypto.createCipheriv(CIPHER_ALG, getKeyHash(key), iv)
	const encr = cipher.update(text)
	const encrypted = Buffer.concat([encr, cipher.final()])

	return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export const decrypt = (text, key) => {
	const textParts = text.split(':')
	const iv = Buffer.from(textParts.shift(), 'hex')
	const encryptedText = Buffer.from(textParts.join(':'), 'hex')
	const decipher = crypto.createDecipheriv(CIPHER_ALG, getKeyHash(key), iv)
	const decr = decipher.update(encryptedText)
	const decrypted = Buffer.concat([decr, decipher.final()])

	return decrypted.toString()
}

export const encryptLegacy = (text, password) => {
	if (!text) return ''
	const cipher = crypto.createCipher(CIPHER_LEGACY_ALG, password)
	let crypted = cipher.update(text, 'utf8', 'hex')
	crypted += cipher.final('hex')
	return crypted
}

export const decryptLegacy = (text, password) => {
	if (!text) return ''
	const decipher = crypto.createDecipher(CIPHER_LEGACY_ALG, password)
	let dec = decipher.update(text, 'hex', 'utf8')
	dec += decipher.final('utf8')
	return dec
}

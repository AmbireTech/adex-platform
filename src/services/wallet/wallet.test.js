const {
	generateSalt,
	getWalletHash,
	getRandomMnemonic,
	generateWallet,
	encrData,
	decrData,
} = require('./wallet')

describe('generateSalt', () => {
	it('should generate different values every time', () => {
		const salts = {}
		const count = 2

		for (let index = 0; index < count; index++) {
			const salt = generateSalt(`somepass${index}`)
			salts[salt] = true
		}

		expect(Object.keys(salts).length).toEqual(count)
	})
})

describe('getWalletHash', () => {
	const salt = generateSalt('somepass')
	const password = 'somepasswordqnkokura'

	it('should return same hash', () => {
		const hahsOne = getWalletHash({ salt, password })
		const hahsTwo = getWalletHash({ salt, password })

		expect(hahsOne).toEqual(hahsTwo)
	})

	it('should return different hash with same salt and different password', () => {
		const hashes = {}

		const count = 2

		for (let index = 0; index < count; index++) {
			const hash = getWalletHash({ salt, password: password + index })
			hashes[hash] = true
		}

		expect(Object.keys(hashes).length).toEqual(count)
	})

	it('should return different hash with same password and different salt', () => {
		const hashes = {}

		const count = 2

		for (let index = 0; index < count; index++) {
			const hash = getWalletHash({
				salt: generateSalt(`somepass${index}`),
				password,
			})
			hashes[hash] = true
		}

		expect(Object.keys(hashes).length).toEqual(count)
	})
})

describe('wallet', () => {
	const mnemonic = getRandomMnemonic()
	const wallet = generateWallet(mnemonic)
	const password = 'somePassWord1282'
	const email = 'kor@mi.qnko'
	it('should generate wallet', () => {
		expect(wallet).toHaveProperty('mnemonic', 'privateKey', 'address', 'path')
	})

	it('can  be encrypted', () => {
		expect(wallet).toHaveProperty('mnemonic', 'privateKey', 'address', 'path')

		const encrypted = encrData({ email, password, data: wallet })
		const decrypted = decrData({ email, password, data: encrypted })
		expect(decrypted).toEqual(wallet)
	})
})

const {
	generateSalt,
	getWalletHash,
	getRandomMnemonic,
	generateWallet,
	encrData,
	decrData,
} = require('.')

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

	it('should return same hash', async () => {
		const hahsOne = await getWalletHash({ salt, password })
		const hahsTwo = await getWalletHash({ salt, password })

		expect(hahsOne).toEqual(hahsTwo)
	})

	it('should return different hash with same salt and different password', async () => {
		const hashes = {}

		const count = 2

		for (let index = 0; index < count; index++) {
			const hash = await getWalletHash({ salt, password: password + index })
			hashes[hash] = true
		}

		expect(Object.keys(hashes).length).toEqual(count)
	})

	it('should return different hash with same password and different salt', async () => {
		const hashes = {}

		const count = 2

		for (let index = 0; index < count; index++) {
			const hash = await getWalletHash({
				salt: generateSalt(`somepass${index}`),
				password,
			})
			hashes[hash] = true
		}

		expect(Object.keys(hashes).length).toEqual(count)
	})
})

describe('wallet', () => {
	it('should generate wallet', async () => {
		const mnemonic = getRandomMnemonic()
		const wallet = await generateWallet(mnemonic)

		expect(wallet).toHaveProperty('mnemonic', 'privateKey', 'address', 'path')
	})

	it('can  be encrypted', async () => {
		const mnemonic = getRandomMnemonic()
		const wallet = await generateWallet(mnemonic)
		const password = 'somePassWord1282'
		const email = 'kor@mi.qnko'
		expect(wallet).toHaveProperty('mnemonic', 'privateKey', 'address', 'path')

		const encrypted = await encrData({ email, password, data: wallet })
		const decrypted = await decrData({ email, password, data: encrypted })
		expect(decrypted).toEqual(wallet)
	})
})

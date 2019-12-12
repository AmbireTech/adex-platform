const { generateSalt, getWalletHash } = require('./wallet')

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

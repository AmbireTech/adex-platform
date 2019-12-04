const { generateSalt } = require('./wallet')

describe('generateSalt', () => {
	it('should generate different values every time', () => {
		const salts = {}
		const count = 1000

		for (let index = 0; index < count; index++) {
			const salt = generateSalt()
			salts[salt] = true
		}

		expect(Object.keys(salts).length).toEqual(count)
	})
})

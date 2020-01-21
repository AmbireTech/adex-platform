const { encrypt, decrypt } = require('./crypto')

describe('encrypt/decrypt', () => {
	it('should encrypt and decrypt data', async () => {
		const key = '51023e1e62e331dd1db5c08e9ecaec3515ffe68e6f2b942b3cf3eb8ca6'
		const data = JSON.stringify({ test: [1, 2, 3, 4] })

		const encrypted = await encrypt(data, key)
		const decrypted = await decrypt(encrypted, key)

		expect(decrypted).toEqual(data)
	})
})

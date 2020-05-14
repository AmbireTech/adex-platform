const { signatureToBtcWallet } = require('./btc')

describe('signatureToBtcWallet', () => {
	it('should return same wallet with same sig', () => {
		const sig =
			'0x946606aca696934465d76ed84a79e696901066969c15f06f4501160cdd0b6969696969f9b82bbeafdc6e5dc907b37ed541b0361b1771386ab0b05582cc7ad27f1b'
		const wallet1 = signatureToBtcWallet(sig)
		const wallet2 = signatureToBtcWallet(sig)
		expect(wallet1.mnemonic).toBe(wallet2.mnemonic)
	})
	it('should return different wallet with different sigs', () => {
		const wallet1 = signatureToBtcWallet(
			'0x946606aca696934465d76ed84a79e696901066969c15f06f4501160cdd0b6969696969f9b82bbeafdc6e5dc907b37ed541b0361b1771386ab0b05582cc7ad27f1b'
		)
		const wallet2 = signatureToBtcWallet(
			'0x946606aca696934465d76ed84a79e696901066969c15f06f4501160cdd0b6969696969f9b82bbeafdc6e5dc907b37ed541b0361b1771386ab0b05582cc7ad26969'
		)
		expect(wallet1.mnemonic).not.toBe(wallet2.mnemonic)
	})
})

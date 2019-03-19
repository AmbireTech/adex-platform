const { adxAmountStrToPrecision } = require('./utils')

describe('adxAmountStrToPrecision', () => {
	it('should parse int with leading zeros', () => {
		expect(adxAmountStrToPrecision('0000200')).toBe('2000000')
	})
	it('should parse valid int 123', () => {
		expect(adxAmountStrToPrecision('123')).toBe('1230000')
	})
	it('should parse valid float 0.3', () => {
		expect(adxAmountStrToPrecision('0.3')).toBe('3000')
	})
	it('should parse valid float 0.0003', () => {
		expect(adxAmountStrToPrecision('0.0003')).toBe('3')
	})
	it('should parse valid float 10.0003', () => {
		expect(adxAmountStrToPrecision('10.0003')).toBe('100003')
	})
	it('should cut the digits after precision 0.00003', () => {
		expect(adxAmountStrToPrecision('0.00003')).toBe('0')
	})
	it('should cut the digits after precision 0.00008', () => {
		expect(adxAmountStrToPrecision('0.00008')).toBe('0')
	})
	it('should cut the digits after precision 0.12345', () => {
		expect(adxAmountStrToPrecision('0.12345')).toBe('1234')
	})
	it('should cut the digits after precision 10.12345', () => {
		expect(adxAmountStrToPrecision('10.12345')).toBe('101234')
	})
	it('should throw on invalid input', () => {
		expect(() => adxAmountStrToPrecision('test.00003')).toThrow('Invalid amount string!')
	})
	it('should throw on invalid input ","', () => {
		expect(() => adxAmountStrToPrecision('0,00003')).toThrow('Invalid amount string!')
	})
})
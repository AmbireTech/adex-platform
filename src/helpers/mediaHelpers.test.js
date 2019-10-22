const { checkExactishAspect } = require('./mediaHelpers')

describe('checkExactishAspect', () => {
	it('should return true', () => {
		expect(checkExactishAspect(100, 100, 100, 100, 5)).toBe(true)
	})
	it('should return true', () => {
		expect(checkExactishAspect(100, 100, 100, 104, 5)).toBe(true)
	})
	it('should return false', () => {
		expect(checkExactishAspect(100, 100, 100, 120, 5)).toBe(false)
	})
})

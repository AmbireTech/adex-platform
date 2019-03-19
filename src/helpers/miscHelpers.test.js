// Test the tests

const Helper = require('./miscHelpers').default

describe('Helper.getRandomInt', () => {
	it('should return -1', () => {
		expect(Helper.getRandomInt(-1, -1)).toBe(-1)
	})
	it('should return 0', () => {
		expect(Helper.getRandomInt(0, 0)).toBe(0)
	})
	it('should return > 1', () => {
		expect(Helper.getRandomInt(2, 100)).toBeGreaterThan(1)
	})
	it('should return >= 1', () => {
		expect(Helper.getRandomInt(1, 100)).toBeGreaterThanOrEqual(1)
	})
	it('should return < 0', () => {
		expect(Helper.getRandomInt(-10, -1)).toBeLessThan(0)
	})
	it('should return <= 0', () => {
		expect(Helper.getRandomInt(-1, 0)).toBeLessThanOrEqual(0)
	})
})

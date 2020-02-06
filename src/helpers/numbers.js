import { parseUnits, bigNumberify } from 'ethers/utils'

export const numStringCPMtoImpression = ({ numStr, decimals }) => {
	if (numStr === null || numStr === undefined) {
		return numStr
	}

	return parseUnits(numStr, decimals)
		.div(bigNumberify(1000))
		.toString()
}

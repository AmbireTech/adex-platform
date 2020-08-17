import { utils, BigNumber } from 'ethers'
const { parseUnits } = utils

export const numStringCPMtoImpression = ({ numStr, decimals }) => {
	if (numStr === null || numStr === undefined) {
		return numStr
	}

	return parseUnits(numStr, decimals)
		.div(BigNumber.from(1000))
		.toString()
}

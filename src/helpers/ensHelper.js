import { ethers } from 'ethers'
import { t } from 'selectors'

export const fetchName = async lookup => {
	const provider = ethers.getDefaultProvider()
	try {
		const name = await provider.lookupAddress(lookup)
		return name //if not set returns null
	} catch (err) {
		console.error(err)
		return t('ENS_NOT_SET')
	}
}

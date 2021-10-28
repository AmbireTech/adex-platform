import { isEthAddress } from 'helpers/validators'

const getMediaUrlWithProvider = (mediaUrl = 'ipfs://', provider = '') => {
	return provider + mediaUrl.substring(7)
}

export const ipfsSrc = src => {
	if (!!src && isEthAddress(src)) {
		return getMediaUrlWithProvider(src, process.env.IPFS_GATEWAY)
	}

	return src
}

import { validations, helpers } from 'adex-models'

export const ipfsSrc = src => {
	if (!!src && validations.Regexes.ipfsRegex.test(src)) {
		return helpers.getMediaUrlWithProvider(src, process.env.IPFS_GATEWAY)
	}

	return src
}

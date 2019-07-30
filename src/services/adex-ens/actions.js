import { ethers } from "ethers"

const provider = ethers.getDefaultProvider()

const resolveENSName = async (address) => {
	return await provider.lookupAddress(address).then(async ensName => {
		if (ensName !== null) {
			const resolvedAddress = await provider.resolveName(ensName)
			if (resolvedAddress === address) {
				return {
					ensName,
					address
				}
			}
		} else {
			return {
				error: 'ENS_NOT_ASSOCIATED'
			}
		}
	})
}

const resolveENSAddress = async (ensName) => {
	const resolvedENSName = await provider.resolveName(ensName)
	if (resolvedENSName !== null) {
		return {
			ensName,
			address: resolvedENSName
		}
	} else {
		return {
			error: 'ENS_NOT_ASSOCIATED'
		}
	}
}

export { resolveENSName, resolveENSAddress }

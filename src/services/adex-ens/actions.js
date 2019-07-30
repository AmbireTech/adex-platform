import { ethers } from "ethers"

const provider = ethers.getDefaultProvider()

const resolveENS = async address => {
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
				error: "Address has no ens name associated to it."
			}
		}
	})
}

export { resolveENS }

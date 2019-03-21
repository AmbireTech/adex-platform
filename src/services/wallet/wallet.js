import {ethers, utils} from 'ethers'

// Returns 12 random words
export function getRandomMnemonic() {
	const randomEntropy = utils.randomBytes(16)
	const mnemonic = utils.HDNode.entropyToMnemonic(randomEntropy)

	return mnemonic
}

export function generateRandomWallet() {
	const mnemonic = getRandomMnemonic()
	const wallet = ethers.Wallet.fromMnemonic(mnemonic)

	return {
		mnemonic,
		privateKey: wallet.privateKey,
		address: wallet.address,
		path: wallet.path
	}
}
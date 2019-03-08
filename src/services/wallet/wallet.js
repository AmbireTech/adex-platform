import {utils} from 'ethers'

// Returns 12 random words
export function getRandomMnemonic() {
    const randomEntropy = utils.randomBytes(32)
    const mnemonic = utils.HDNode.entropyToMnemonic(randomEntropy)

    return mnemonic
}

function generateRandomWallet() {
}
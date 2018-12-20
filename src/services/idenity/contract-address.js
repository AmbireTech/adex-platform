import { ethers } from 'ethers'
// import { utils } from 'ethers/utils'
import rlp from 'rlp'

export const getRandomSeed = ({ extraEntropy = '' }) => {
    const randomBytes = ethers.utils.randomBytes()
    const entropy = ethers.utils.keccak256([extraEntropy, randomBytes])
    const randomSeed = ethers.utils.HDNode(entropy)

    return randomSeed
}

export const getNewRandomAddress = ({ extraEntropy }) => {
    const wallet = ethers.Wallet.fromMnemonic(getRandomSeed({ extraEntropy }))
    const addres = wallet.address

    return addres
}

export const getIdentityContractAddress = ({ extraEntropy }) => {
    const randomSeed = getRandomSeed({ extraEntropy })
    const wallet = ethers.Wallet.fromMnemonic(randomSeed)
    // const rlpEncoded = rlp.encode([addr, 0])
    // const idenityContractAddr = utils.keccak256(rlpEncoded)

    return { addr: wallet.address, seed: randomSeed }
}
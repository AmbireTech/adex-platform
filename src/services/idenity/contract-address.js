import { ethers, utils } from 'ethers'
// import { utils } from 'ethers/utils'
import rlp from 'rlp'

export const getRandomSeed = ({ extraEntropy = '' }) => {
    const randomBytes = utils.randomBytes(16)
    const extra = utils.arrayify(utils.toUtf8Bytes(extraEntropy))
    const extraExtra = utils.concat([extra, randomBytes])
    const entropy = utils.keccak256(extraExtra)
    const randomSeed = ethers.utils.HDNode.entropyToMnemonic(entropy)

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
    
    return { addr: wallet.address, seed: randomSeed }
}
import ethers from 'ethers'
import utils from 'ethers/utils'
import rpl from 'rpl'

export const getNewRandomAddress = ({ extraEntropy }) => {
    const wallet = ethers.Wallet.createRandom({ extraEntropy })
    const addres = wallet.address

    return addres
}

export const getIdentityContractAddress = ({ extraEntropy }) => {
    const addr = getNewRandomAddress({ extraEntropy })
    const rplEncoded = rpl.encode([addr, 0])
    const idenityContractAddr = utils.keccak256(rplEncoded)

    return idenityContractAddr
}
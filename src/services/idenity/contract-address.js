import { ContractFactory, utils } from 'ethers'
import identityJson from './../smart-contracts/build/Identity.json'
import { getIdentityDeployData, getContractAddrWithZeroNonce } from 'adex-protocol-eth/js'

export const getRandomSeed = () => {
    const randomSeed = utils.randomBytes(64)
    return randomSeed
}

export const getDeployTx = ({ addr, privLevel, feeTokenAddr, feeBeneficiery, feeTokenAmount }) => {
    const factory = new ContractFactory(identityJson.abi, identityJson.bytecode)
    const deployTx = factory.getDeployTransaction(
        addr,
        privLevel,
        feeTokenAddr,
        feeBeneficiery,
        feeTokenAmount,
    )

    // TODO: deployTx.gasPrice

    return deployTx
}

export const getRandomAddressForDeployTx = ({ deployTx }) => {

    const randomSeed = getRandomSeed()
    const data = getIdentityDeployData(randomSeed, deployTx)
    return data
}
import { ContractFactory, utils } from 'ethers'
import identityJson from './../smart-contracts/build/Identity.json'
import { getIdentityDeployData, getContractAddrWithZeroNonce } from 'adex-protocol-eth/js'
import { cfg, getWeb3, web3Utils } from 'services/smart-contracts/ADX'

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

export const deployIdentityContract = async ({ deployData, authType, owner }) => {
    const { web3 } = await getWeb3(authType || 'metamask')

    const fundReciept = await web3.eth.sendTransaction({
        from: owner,
        to: deployData.tx.from,
        value: deployData.tx.gasLimit * deployData.tx.gasPrice,
        gasPrice: deployData.tx.gasPrice
    })

    const deployReceipt = await web3.eth.sendSignedTransaction(deployData.txRaw)
    return ({
        fundReciept,
        deployReceipt
    })
}
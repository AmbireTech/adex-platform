import { getRandomSeed } from './contract-address.js';

const { getDeployTx, getRandomAddressForDeployTx } = require('./contract-address')

describe('getRandomSeed', () => {
    const seedsCount = 10000
    it(`shoud return ${seedsCount} different values`, () => {
        expect((() => {
            const map = {}

            for (let index = 0; index < seedsCount; index++) {
                const seed = getRandomSeed()
                map[seed] = true
            }

            const seeds = (Object.keys(map)).length

            return seeds
        })()).toBe(seedsCount)
    })
})

describe('contract-address getRandomAddressForDeployTx', () => {
    it('should return data with idContractAddr', () => {

        const deployTx = getDeployTx({
            addr: '0x0A8fe6e91eaAb3758dF18f546f7364343667E957',
            privLevel: 3,
            feeTokenAddr: '0x4470BB87d77b963A013DB939BE332f927f2b992e',
            feeBeneficiary: '0x0A8fe6e91eaAb3758dF18f546f7364343667E957',
            feeTokenAmount: '10000'
        })

        const deployAddrData = getRandomAddressForDeployTx({ deployTx })
        const idContractAddr = deployAddrData.idContractAddr

        expect(idContractAddr).toHaveLength(42)
    })
})
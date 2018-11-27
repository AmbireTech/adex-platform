import { getWeb3 } from 'services/smart-contracts/ADX'
import { getTypedDataHash } from 'services/smart-contracts/utils'

export const getAccount = ({ privateKey, authType } = {}) => {
    return getWeb3(authType)
        .then(({ web3 }) => {
            if (privateKey) {
                return web3.eth.accounts.privateKeyToAccount(privateKey)
            }
            throw new Error('No private key!')
        })
}

export const sigMsg = ({ msg = 'universal-sign', account }) => {

    let typedData = [
        { type: 'uint', name: 'Auth token', value: msg }
    ]

    let hash = getTypedDataHash({ typedData: typedData })

    const sig = account.sign(hash)

    return { sig, hash }
}
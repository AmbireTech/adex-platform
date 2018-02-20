import { getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { TO_HEX_PAD } from 'services/smart-contracts/constants'

const PRODUCTION_MODE = process.env.NODE_ENV === 'production'

export const setWallet = ({ prKey, addr = '' }) => {

    return new Promise((resolve, reject) => {

        getWeb3.then(({ web3, exchange, token }) => {

            /* HACK: because of the testrpc
            * generated addr from prKey (no leading 0x) is different than needed for testrpc 
            */
            if (addr && !web3Utils.isAddress(addr)) {
                throw 'invalid eth address'
            }

            let cleanPrKey = prKey.replace(/^(0[xX])/, '')

            if (cleanPrKey.length !== 64) {
                throw 'invalid private key'
            }

            // NOTE: because of the way web3 works, it needs key prefixed with 0x
            // see https://github.com/ethereum/web3.js/issues/1094
            // NOTE: in development mode testrpc pr key need to be without 0x
            if (PRODUCTION_MODE) {
                prKey = '0x' + cleanPrKey
            } else {
                prKey = cleanPrKey
            }

            let wallet = web3.eth.accounts.wallet
            let acc = web3.eth.accounts.privateKeyToAccount(prKey)

            wallet.add(acc)

            // NOTE: in production privateKeyToAccount generates different address when  w/ or w/o 0x
            // for testrpc the generated
            if (PRODUCTION_MODE) {
                addr = wallet[0].address
            }

            // console.log('setWalletAndGetAddress addr', addr)
            // console.log('setWalletAndGetAddress prKey', prKey)

            return resolve({ addr: addr, prKey: prKey })
        })
    })
}

export const getAccountMetamask = () => {
    return new Promise((resolve, reject) => {
        getWeb3.then(({ web3, mode }) => {
            web3.eth.getAccounts((err, accounts) => {
                //TODO: maybe different check for different modes
                if (err || !accounts || !accounts[0]) {
                    return resolve({ addr: null, mode: mode })
                } else if (accounts && accounts[0]) {
                    return resolve({ addr: accounts[0].toLowerCase(), mode: mode })
                } else {
                    return resolve({ addr: null, mode: mode })
                }
            })
        })
    })
}

export const signAuthToken = ({ authToken, userAddr }) => {
    return new Promise((resolve, reject) => {
        getWeb3.then(({ web3, exchange, token, mode }) => {
            //TEMP: until metamask way recovery on the node
            console.log('sig authToken', authToken)
            let sig = web3.eth.accounts.sign(authToken, '0xa9212d1d1fd949a813119361f3e9bb2cf1bda7dbedbde4a75f4ed3bd93642096').signature

            console.log('sig', sig)

            return resolve(sig)
        })
    })
}

export const signAuthTokenMetamask = ({ userAddr }) => {
    return new Promise((resolve, reject) => {
        let authToken = (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)).toString()
        let typed = [
            { type: 'uint', name: 'Auth token', value: authToken }
        ]

        getWeb3.then(({ web3, exchange, token, mode }) => {

            web3.currentProvider.sendAsync({
                method: 'eth_signTypedData',
                params: [typed, userAddr],
                from: userAddr
            }, (err, res) => {
                // console.log('err', err)
                // console.log('res', res)
                if (err) {
                    return reject(err)
                }

                if (res.error) {
                    return reject(res.error)
                }

                let signature = { sig_mode: mode, sig: res.result, authToken: authToken, typedData: typed }
                return resolve(signature)
            })
            // }
        })
    })
}

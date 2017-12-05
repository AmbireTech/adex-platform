import { web3 } from 'services/smart-contracts/ADX'
import { TO_HEX_PAD } from 'services/smart-contracts/constants'

const web3Utils = web3.utils

const PRODUCTION_MODE = process.env.NODE_ENV === 'production'

export const setWallet = ({ prKey, addr = '' }) => {

    /* HACK: because of the testrpc
    * generated addr from prKey (no leading 0x) is different than needed for testrpc 
    */
    if (addr && !web3.utils.isAddress(addr)) {
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

    return { addr: addr, prKey: prKey }
}
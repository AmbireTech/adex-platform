import configureStore from 'store/configureStore'
import actions from 'actions'
import scActions from 'services/smart-contracts/actions'
import { exchange as ExchangeConstants } from 'adex-constants'
const { TX_STATUS } = ExchangeConstants

const { getTransactionsReceipts } = scActions
const { store } = configureStore

let transactionsCheckTimeout = null

const clearTransactionsTimeout = () => {
    if(transactionsCheckTimeout){
        clearTimeout(transactionsCheckTimeout)
        transactionsCheckTimeout = null
    }
}

const shoudUpdateTransaction = () => {

}

const syncTransactions = () => {
    const persist = store.getState().persist    
    const addr = persist.account._addr
    let transactions = persist.web3Transactions[addr]
    let hashes = Object.keys(transactions).reduce((memo, key) => {
        if(key && ((key.toString()).length === 66)){
            memo.push(key)
        }
        return memo
    }, [])

    return getTransactionsReceipts(hashes)
        .then((receipts)=>{
            receipts.forEach((rec) => {
                // console.log('rec', rec)                
                if(rec && rec.transactionHash && rec.status){
                    // TODO: Make constants for transactions status
                    let status = rec.status === '0x1' ? TX_STATUS.Success.id : TX_STATUS.Error.id

                    if(transactions[rec.transactionHash].status !==  status){                    
                        let action = actions.updateWeb3Transaction({ trId: rec.transactionHash, key: 'status', value: status, addr: addr })
                        action(store.dispatch)
                    }
                }
            })
        })
}

const checkTransactions = () => {
    syncTransactions()
        .then(() => {
            checkTransactionsLoop()
        })
        .catch(() => {
            checkTransactionsLoop()
        })
}

const checkTransactionsLoop = () => {
    clearTransactionsTimeout()

    transactionsCheckTimeout = setTimeout(checkTransactions, 20 * 1000)
}

const start = () => {
    clearTransactionsTimeout()
    checkTransactions()
}

const stop = () => {
    clearTransactionsTimeout()
}


export default {
    start,
    stop
}
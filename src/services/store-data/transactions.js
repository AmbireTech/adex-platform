import configureStore from 'store/configureStore'
import actions from 'actions'
import scActions from 'services/smart-contracts/actions'
import { exchange as ExchangeConstants } from 'adex-constants'
const { TX_STATUS } = ExchangeConstants

const { getTransactionsReceipts } = scActions
const { store } = configureStore

let transactionsCheckTimeout = null

const clearTransactionsTimeout = () => {
    if (transactionsCheckTimeout) {
        clearTimeout(transactionsCheckTimeout)
        transactionsCheckTimeout = null
    }
}

const syncTransactions = () => {
    const persist = store.getState().persist
    const addr = persist.account._addr
    const transactions = persist.web3Transactions[addr] || {}
    const hashes = Object.keys(transactions).reduce((memo, key) => {
        if (key && ((key.toString()).length === 66)) {
            memo.push(key)
        }
        return memo
    }, [])

    if (!hashes.length) {
        return Promise.resolve()
    }

    return getTransactionsReceipts(hashes)
        .then((receipts) => {
            receipts.forEach((rec) => {
                if (rec && rec.transactionHash && rec.status) {
                    // NOTE: web3.eth.getTransactionReceipt changed status vale from 0x1 to true for success but we keep bot now
                    const status = ((rec.status === '0x1') || (rec.status === true)) ? TX_STATUS.Success.id : TX_STATUS.Error.id
                    if (transactions[rec.transactionHash].status !== status) {
                        actions.execute(actions.updateWeb3Transaction({ trId: rec.transactionHash, key: 'status', value: status, addr: addr }))
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

// const addTransaction


export default {
    start,
    stop
}
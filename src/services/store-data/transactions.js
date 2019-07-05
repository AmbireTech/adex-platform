import configureStore from 'store/configureStore'
import actions from 'actions'
import { getTransactionsReceipts } from 'services/smart-contracts/actions/ethers'
import { exchange as ExchangeConstants } from 'adex-constants'
const { TX_STATUS } = ExchangeConstants
const { store } = configureStore

let transactionsCheckTimeout = null

const clearTransactionsTimeout = () => {
	if (transactionsCheckTimeout) {
		clearTimeout(transactionsCheckTimeout)
		transactionsCheckTimeout = null
	}
}

const syncTransactions = async () => {
	const { account, web3Transactions } = store.getState().persist
	const transactions = {
		...(web3Transactions[account.wallet.address] || {}),
		...(web3Transactions[account.identity.address] || {}),
	}
	const txHashes = Object.keys(transactions).reduce((memo, key) => {
		if (key && ((key.toString()).length === 66)) {
			memo.push(key)
		}
		return memo
	}, [])

	if (!txHashes.length) {
		return
	}

	const receipts = await getTransactionsReceipts({ txHashes, authType: account.wallet.authType })

	// return
	receipts.forEach((rec) => {
		if (rec && rec.transactionHash && rec.status) {
			// NOTE: web3.eth.getTransactionReceipt changed status vale from 0x1 to true for success but we keep bot now
			const status = ((rec.status === 1) || (rec.status === '0x1') || (rec.status === true)) ? 'success' : 'failed'
			if (transactions[rec.transactionHash].status !== status) {
				actions.execute(actions.updateWeb3Transaction({ tx: rec.transactionHash, key: 'status', value: status, addr: rec.from }))
			}
		}
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
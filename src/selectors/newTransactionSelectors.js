import { createCachedSelector } from 're-reselect'

export const selectNewTransactions = state => state.memory.newTransactions

export const selectNewTransactionById = createCachedSelector(
	selectNewTransactions,
	(_, id) => id,
	(txns, id) => txns[id] || {}
)((_state, id) => id)

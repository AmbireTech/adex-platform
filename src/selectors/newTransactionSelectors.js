import { createSelector } from 'reselect'

export const selectNewTransactions = state => state.memory.newTransactions

export const selectNewTransactionById = createSelector(
	[selectNewTransactions, (_, id) => id],
	(txns, id) => txns[id] || {}
)

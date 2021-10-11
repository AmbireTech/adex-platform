import { createCachedSelector } from 're-reselect'
import initialState from 'store/initialState'

export const selectNewTransactions = state => state.memory.newTransactions

export const selectNewTransactionById = createCachedSelector(
	selectNewTransactions,
	(_, id) => id,
	(txns, id) => txns[id] || initialState.newTransactions.default
)((_state, id = '-') => id)

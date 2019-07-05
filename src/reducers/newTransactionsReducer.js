import { UPDATE_NEW_TRANSACTION, RESET_NEW_TRANSACTION } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function newTransactionsReducer(state = initialState.newTransactions, action) {
	let newState
	let newTx

	newState = { ...state }

	// No model update
	const updateTx = ({ tx, key, val }) => {
		tx = tx || {}
		tx[key] = val

		return tx
	}

	switch (action.type) {
	case UPDATE_NEW_TRANSACTION:
		newTx = { ...(newState[action.tx] || initialState.newTransactions.default) }
		newTx = updateTx({ tx: newTx, key: action.key, val: action.value })

		// console.log('newTx', newTx)
		newState[action.tx] = newTx
		return newState
	case RESET_NEW_TRANSACTION:
		newTx = { ...initialState.newTransactions.default }
		newState[action.tx] = newTx
		return newState
	default:
		return state
	}
}

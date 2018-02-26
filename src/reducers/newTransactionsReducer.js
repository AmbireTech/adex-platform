import { UPDATE_NEW_TRANSACTION, RESET_NEW_TRANSACTION } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function newTransactionsReducer(state = initialState.newTransactions, action) {
    let newState
    let newTr

    newState = { ...state }

    // No model update
    const updateTr = ({ tr, key, val }) => {
        tr = tr || {}
        tr[key] = val

        return tr
    }

    switch (action.type) {
        case UPDATE_NEW_TRANSACTION:
            newTr = { ...(newState[action.trId] || initialState.newTransactions.default) }
            newTr = updateTr({ tr: newTr, key: action.key, val: action.value })

            // console.log('newTr', newTr)
            newState[action.trId] = newTr
            return newState
        case RESET_NEW_TRANSACTION:
            newTr = { ...initialState.newTransactions.default }
            newState[action.trId] = newTr
            return newState
        default:
            return state
    }
}

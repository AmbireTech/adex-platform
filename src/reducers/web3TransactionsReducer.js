import { UPDATE_WEB3_TRANSACTION, RESET_WEB3_TRANSACTION } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function web3TransactionsReducer(state = initialState.web3Transactions, action) {
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
        case UPDATE_WEB3_TRANSACTION:
            newTr = { ...(newState[action.trId] || initialState.web3Transactions.default) }
            newTr = updateTr({ tr: newTr, key: action.key, val: action.value })

            console.log('newTr', newTr)
            newState[action.trId] = newTr
            return newState
        case RESET_WEB3_TRANSACTION:
            newTr = { ...initialState.web3Transactions.default }
            newState[action.trId] = newTr
            return newState
        default:
            return state
    }
}

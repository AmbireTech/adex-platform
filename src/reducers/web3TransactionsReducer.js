import { ADD_WEB3_TRANSACTION, UPDATE_WEB3_TRANSACTION, RESET_WEB3_TRANSACTION } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function web3TransactionsReducer(state = initialState.web3Transactions, action) {
    let newState
    let newTr
    let newAddrTrs

    newState = { ...state }

    // No model update
    const updateObj = ({ obj, key, val }) => {
        obj = obj || {}
        obj[key] = val

        return obj
    }

    if(!action.addr) {
        return state
    }

    // NOTE: keep transaction by address in order to keep them in the persist storage when the user is switch
    // If we keep the transactions on the node we can clean them from local storage on address change
    switch (action.type) {
        case ADD_WEB3_TRANSACTION:
            newAddrTrs = {...newState[action.addr] || {}}
            newTr = { ...action.value }  
            newAddrTrs[action.trId] = newTr
            newState[action.addr] = newAddrTrs
            return newState
        case UPDATE_WEB3_TRANSACTION:
            newAddrTrs = {...newState[action.addr] || {}}
            newTr = { ...(newAddrTrs[action.trId] || {}) }
            newTr = updateObj({ obj: newTr, key: action.key, val: action.value })
            newAddrTrs[action.trId] = newTr
            newState[action.addr] = newAddrTrs
            return newState
        case RESET_WEB3_TRANSACTION:
            newAddrTrs = {...newState[action.addr]}
            newTr = { ...initialState.web3Transactions.default }
            newAddrTrs[action.trId] = newTr
            newState[action.trId] = newTr
            return newState
        default:
            return state
    }
}

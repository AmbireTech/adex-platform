import { ADD_WEB3_TRANSACTION, UPDATE_WEB3_TRANSACTION, RESET_WEB3_TRANSACTION } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function web3TransactionsReducer(state = initialState.web3Transactions, action) {
    let newState
    let newTx
    let newAddrTxs
    let pendingTxs

    newState = { ...state }

    // No model update
    const updateObj = ({ obj, key, val }) => {
        obj = obj || {}
        obj[key] = val

        return obj
    }

    const updatePendingTxs = ({pTxs, newTx}) => {
        if(newTx.status === 0 && pTxs.indexOf(newTx.trHash)){
            pTxs.push(newTx.trHash)
        }else {
            pTxs = pTxs.filter((tx)=> tx !== newTx.trHash)
        }

        return pTxs
    }

    if(!action.addr) {
        return state
    }

    newAddrTxs = {...newState[action.addr] || {}}
    pendingTxs = [...(newAddrTxs.pendingTxs || [])]


    // NOTE: keep transaction by address in order to keep them in the persist storage when the user is switch
    // If we keep the transactions on the node we can clean them from local storage on address change
    switch (action.type) {
        case ADD_WEB3_TRANSACTION:
            newTx = { ...action.value }  
            newAddrTxs[action.trId] = newTx
            newAddrTxs.pendingTxs = updatePendingTxs({pTxs: pendingTxs, newTx: newTx})
            newState[action.addr] = newAddrTxs
            return newState
        case UPDATE_WEB3_TRANSACTION:
            newTx = { ...(newAddrTxs[action.trId] || {}) }
            newTx = updateObj({ obj: newTx, key: action.key, val: action.value })
            newAddrTxs[action.trId] = newTx
            newAddrTxs.pendingTxs = updatePendingTxs({pTxs: pendingTxs, newTx: newTx})
            newState[action.addr] = newAddrTxs
            return newState
        case RESET_WEB3_TRANSACTION:
            newTx = { ...initialState.web3Transactions.default }
            newAddrTxs[action.trId] = newTx
            newAddrTxs.pendingTxs = updatePendingTxs({pTxs: pendingTxs, newTx: {trHash: action.trId}})
            newState[action.trId] = newTx
            return newState
        default:
            return state
    }
}

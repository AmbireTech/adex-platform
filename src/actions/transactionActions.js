import * as types from 'constants/actionTypes'

// MEMORY STORAGE
export function updateNewTransaction({ trId, key, value }) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_NEW_TRANSACTION,
            trId: trId,
            key: key,
            value: value
        })
    }
}

export function resetNewTransaction({ trId }) {
    return function (dispatch) {
        return dispatch({
            type: types.RESET_NEW_TRANSACTION,
            trId: trId
        })
    }
}

// TODO: add transactions to persistence (for now just there)
// Make call to etherscan api some day in order to skip all blocks scans for transactions history
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

// PERSIST STORAGE
export function updateWeb3Transaction({ trId, key, value }) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_WEB3_TRANSACTION,
            trId: trId,
            key: key,
            value: value
        })
    }
}

export function resetWeb3Transaction({ trId }) {
    return function (dispatch) {
        return dispatch({
            type: types.RESET_WEB3_TRANSACTION,
            trId: trId
        })
    }
}
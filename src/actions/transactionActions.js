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
export function addWeb3Transaction({ trans, addr }) {
    return function (dispatch) {

        if (!trans || !trans.trHash || !addr) return

        return dispatch({
            type: types.ADD_WEB3_TRANSACTION,
            value: trans,
            trId: trans.trHash,
            addr: addr
        })
    }
}

// TODO: make update multiple
export function updateWeb3Transaction({ trId, key, value, addr }) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_WEB3_TRANSACTION,
            trId: trId,
            key: key,
            value: value,
            addr: addr
        })
    }
}

export function resetWeb3Transaction({ trId, addr }) {
    return function (dispatch) {
        return dispatch({
            type: types.RESET_WEB3_TRANSACTION,
            trId: trId,
            addr: addr
        })
    }
}
import * as types from 'constants/actionTypes'

// MEMORY STORAGE
export function updateNewTransaction({ tx, key, value }) {
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_NEW_TRANSACTION,
			tx: tx,
			key: key,
			value: value
		})
	}
}

export function resetNewTransaction({ tx }) {
	return function (dispatch) {
		return dispatch({
			type: types.RESET_NEW_TRANSACTION,
			tx: tx
		})
	}
}

// PERSIST STORAGE
export function addWeb3Transaction({ tx, addr }) {
	return function (dispatch) {

		if (!tx || !tx.hash || !addr) return

		return dispatch({
			type: types.ADD_WEB3_TRANSACTION,
			value: tx,
			tx: tx.hash,
			addr: addr
		})
	}
}

// TODO: make update multiple
export function updateWeb3Transaction({ tx, key, value, addr }) {
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_WEB3_TRANSACTION,
			tx: tx,
			key: key,
			value: value,
			addr: addr
		})
	}
}

export function resetWeb3Transaction({ tx, addr }) {
	return function (dispatch) {
		return dispatch({
			type: types.RESET_WEB3_TRANSACTION,
			tx: tx,
			addr: addr
		})
	}
}
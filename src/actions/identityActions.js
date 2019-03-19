import * as types from 'constants/actionTypes'

// MEMORY STORAGE
export function updateIdentity(prop, value) {
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_IDENTITY,
			prop: prop,
			value: value
		})
	}
}

export function resetIdentity() {
	return function (dispatch) {
		return dispatch({
			type: types.RESET_IDENTITY
		})
	}
}

// MEMORY STORAGE
export function updateWallet(prop, value) {
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_WALLET,
			prop: prop,
			value: value
		})
	}
}

export function resetWallet() {
	return function (dispatch) {
		return dispatch({
			type: types.RESET_WALLET
		})
	}
}
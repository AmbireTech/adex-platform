import * as types from 'constants/actionTypes'

// MEMORY STORAGE
export function updateSignin(prop, value) {
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_SIGNIN,
			prop: prop,
			value: value
		})
	}
}

export function resetSignin() {
	return function (dispatch) {
		return dispatch({
			type: types.RESET_SIGNIN
		})
	}
}


// PERSISTENT STORAGE
export function createAccount(acc) {
	return function (dispatch) {
		return dispatch({
			type: types.CREATE_ACCOUNT,
			account: acc
		})
	}
}

// LOGOUT
export function resetAccount() {
	return function (dispatch) {
		return dispatch({
			type: types.RESET_ACCOUNT
		})
	}
}

export function updateAccount({ meta, ownProps }) {
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_ACCOUNT,
			meta: meta,
			ownProps: ownProps,
		})
	}
}

export function updateGasData({gasData}) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_GAS_DATA,
			gasData: gasData
		})
	}
}
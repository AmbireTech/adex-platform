import * as types from "constants/actionTypes"

export function updateENSResolution({ ensName, address }) {
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_ENS_RESOLUTION,
			ensName: ensName,
			address: address,
			error: ""
		})
	}
}

export function updateENSResolutionError(error, address) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_ENS_RESOLUTION_ERROR,
			error,
			ensName: "",
			address: address
		})
	}
}
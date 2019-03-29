import * as types from 'constants/actionTypes'
import { grantAccount } from 'services/adex-relayer/actions'

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

export function getGrantAccount({walletAddr, email, coupon}) {
	return async function (dispatch) {
		const identityInfo = await grantAccount({
			ownerAddr: walletAddr,
			mail: email,
			couponCode: coupon
		})

		return dispatch({
			type: types.UPDATE_IDENTITY,
			prop: 'identityAddr',
			value: identityInfo.deployData.idContractAddr
		})
	}
}
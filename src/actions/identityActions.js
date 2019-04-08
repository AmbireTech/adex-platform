import * as types from 'constants/actionTypes'
import { grantAccount } from 'services/adex-relayer/actions'
import { updateSpinner } from './uiActions'
import { deployIdentityContract } from 'services/smart-contracts/actions/identity'
import { registerFullIdentity } from 'services/adex-relayer/actions'
import { addToast } from './uiActions'
import {
	getIdentityDeployData
} from 'services/smart-contracts/actions/identity'
import { addDataToWallet } from 'services/wallet/wallet'

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

export function getGrantAccount({ walletAddr, email, password, coupon }) {
	return async function (dispatch) {
		updateSpinner('getting-grant-identity', true)(dispatch)
		try {
			const identityInfo = await grantAccount({
				ownerAddr: walletAddr,
				mail: email,
				couponCode: coupon
			})

			const identity = identityInfo.deployData.idContractAddr

			if (identityInfo) {
				addDataToWallet({
					email,
					password,
					dataKey: 'identity',
					dataValue: identity
				})
				return dispatch({
					type: types.UPDATE_IDENTITY,
					prop: 'identityAddr',
					value: identity
				})
			}
		} catch (err) {
			addToast({
				type: 'cancel',
				label: 'ERR_REGISTER_GRANT_IDENTITY',
				args: [err],
				timeout: 20000
			})(dispatch)
		}

		updateSpinner('getting-grant-identity', false)(dispatch)
	}
}

export function deployFullIdentity({ wallet, email, identityTxData, identityAddr }) {
	return async function (dispatch) {
		updateSpinner('getting-grant-identity', true)(dispatch)
		try {
			const tx = await deployIdentityContract({
				...identityTxData,
				wallet
			})

			const regInfo = await registerFullIdentity({
				txHash: tx.hash,
				identity: identityAddr,
				privileges: [wallet.address, 3],
				mail: email
			})

			if (regInfo) {
				updateIdentity('isRegistered', true)(dispatch)
			} else {
				addToast({
					type: 'cancel',
					label: 'ERR_REGISTER_IDENTITY',
					args: [tx.hash],
					timeout: 20000
				})(dispatch)
			}
		}
		catch (err) {
			addToast({
				type: 'cancel',
				label: 'ERR_REGISTER_IDENTITY',
				args: [err],
				timeout: 20000
			})(dispatch)
		}
		updateSpinner('getting-grant-identity', true)(dispatch)

	}
}

export function getFullIdentityTxData({ owner, privLevel }) {
	return async function (dispatch) {
		try {
			const txData = await getIdentityDeployData({ owner, privLevel })
			updateIdentity('identityAddr', txData.expectedAddr)(dispatch)
			updateIdentity('identityTxData', txData)(dispatch)
		} catch (err) {
			addToast({
				type: 'cancel',
				label: 'ERR_GET_IDENTITY_TX_DATA',
				args: [err],
				timeout: 20000
			})(dispatch)
		}
	}
}
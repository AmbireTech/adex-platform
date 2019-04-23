import * as types from 'constants/actionTypes'
import { grantAccount } from 'services/adex-relayer/actions'
import { updateSpinner } from './uiActions'
import { deployIdentityContract } from 'services/smart-contracts/actions/identity'
import {
	registerFullIdentity,
	registerExpectedIdentity
} from 'services/adex-relayer/actions'
import { translate } from 'services/translations/translations'
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
			const identityData = await grantAccount({
				ownerAddr: walletAddr,
				mail: email,
				couponCode: coupon
			})

			// TODO: validate identityData

			if (identityData) {
				addDataToWallet({
					email,
					password,
					dataKey: 'identity',
					dataValue: identityData.address
				})
				addDataToWallet({
					email,
					password,
					dataKey: 'privileges',
					dataValue: identityData.privileges
				})
				updateIdentity('identityAddr', identityData.address)(dispatch)
				updateIdentity('identityData', identityData)(dispatch)
			}
		} catch (err) {
			console.error('ERR_REGISTER_GRANT_IDENTITY', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_REGISTER_GRANT_IDENTITY',
					{ args: [err] }),
				timeout: 20000
			})(dispatch)
		}

		updateSpinner('getting-grant-identity', false)(dispatch)
	}
}

export function deployFullIdentity({ wallet, email, identityTxData, identityAddr }) {
	return async function (dispatch) {
		updateSpinner('getting-full-identity', true)(dispatch)
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
					label: translate('ERR_REGISTER_IDENTITY',
						{ args: [tx.hash] }),
					timeout: 20000
				})(dispatch)
			}
		}
		catch (err) {
			console.error('ERR_REGISTER_IDENTITY', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_REGISTER_IDENTITY',
					{ args: [err] }),
				timeout: 20000
			})(dispatch)
		}
		updateSpinner('getting-full-identity', false)(dispatch)

	}
}

export function getFullIdentityTxData({ owner, privLevel }) {
	return async function (dispatch) {
		try {
			const txData = await getIdentityDeployData({ owner, privLevel })
			updateIdentity('identityAddr', txData.expectedAddr)(dispatch)
			updateIdentity('identityTxData', txData)(dispatch)
		} catch (err) {
			console.error('ERR_GET_IDENTITY_TX_DATA', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_GET_IDENTITY_TX_DATA',
					{ args: [err] }),
				timeout: 20000
			})(dispatch)
		}
	}
}

export function getRegisterExpectedIdentity({ owner, mail }) {
	return async function (dispatch) {
		updateSpinner('getting-expected-identity', true)(dispatch)
		try {
			const identityData = await registerExpectedIdentity({ owner, mail })
			updateIdentity('identityData', identityData)(dispatch)
		} catch (err) {
			console.error('ERR_REGISTERING_EXPECTED_IDENTITY', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_REGISTERING_EXPECTED_IDENTITY',
					{ args: [err] }),
				timeout: 20000
			})(dispatch)
		}
		updateSpinner('getting-expected-identity', false)(dispatch)
	}
}
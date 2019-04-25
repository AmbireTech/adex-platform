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
import { saveToLocalStorage } from 'helpers/localStorageHelpers'
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

export function  onUploadLocalWallet(event) {
	return async function (dispatch) {
		updateSpinner('uploading-account-data', true)(dispatch)
		const file = event.target.files[0]
		const reader = new FileReader()

		reader.onload = (ev) => {
			try{
				const obj = JSON.parse(ev.target.result)
				if(!obj || !obj.key || !obj.wallet || !obj.wallet.data || !obj.wallet.identity || !obj.wallet.privileges) {				
					throw new Error(translate('INVALID_JSON_DATA'))
				} else {
					saveToLocalStorage(obj.wallet, obj.key)
					addToast({
						type: 'accept',
						label: translate('SUCCESS_UPLOADING_ACCOUNT_DATA'),
						timeout: 5000
					})(dispatch)
				}
			} catch (err) {
				console.error('Error uploading account json data: ', err)
				addToast({
					type: 'cancel',
					label: translate('ERR_UPLOADING_ACCOUNT_DATA',
						{args: [err.message]}),
					timeout: 5000
				})(dispatch)
			}
			updateSpinner('uploading-account-data', true)(dispatch)
		}

		const onError = (err) => {
			console.error('Error uploading account data.', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_UPLOADING_ACCOUNT_DATA', {args: [err]}),
				timeout: 5000
			})(dispatch)
			updateSpinner('uploading-account-data', true)(dispatch)
		}

		reader.onerror = (ev) => {
			reader.abort()
			onError(translate())
		}

		reader.onabort = (ev) => {
			onError(translate('ABORTING_DATA_UPLOAD'))
		}

		reader.readAsText(file)
	}
}
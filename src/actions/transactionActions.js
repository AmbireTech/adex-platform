import * as types from 'constants/actionTypes'
import { updateSpinner, handleAfterValidation, addToast } from 'actions'
import { selectNewTransactionById, t } from 'selectors'
import Helper from 'helpers/miscHelpers'

// MEMORY STORAGE
export function updateNewTransaction({ tx, key, value }) {
	return async function(dispatch) {
		await dispatch({
			type: types.UPDATE_NEW_TRANSACTION,
			tx: tx,
			key: key,
			value: value,
		})
	}
}

export function resetAllNewTransaction() {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_ALL_NEW_TRANSACTIONS,
		})
	}
}

export function resetNewTransaction({ tx }) {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_NEW_TRANSACTION,
			tx: tx,
		})
	}
}

export function completeTx({
	stepsId,
	competeAction,
	validateId,
	onValid,
	onInvalid,
	stepsProps,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		await updateNewTransaction({
			tx: stepsId,
			key: 'waitingForWalletAction',
			value: true,
		})(dispatch)

		let isValid = false

		try {
			const state = getState()
			const transaction = selectNewTransactionById(state, stepsId)

			await competeAction({ stepsProps, stepsId, ...transaction })(
				dispatch,
				getState
			)
			isValid = true
		} catch (err) {
			console.error('ERR_TRANSACTION', err)
			addToast({
				type: 'cancel',
				label: t('ERR_TRANSACTION', { args: [Helper.getErrMsg(err)] }),
				timeout: 50000,
			})(dispatch)
		}

		await updateSpinner(validateId, false)(dispatch)
		await updateNewTransaction({
			tx: stepsId,
			key: 'waitingForWalletAction',
			value: false,
		})(dispatch)
		await handleAfterValidation({ isValid, onValid, onInvalid })
		// TODO: reset tx if OK
	}
}

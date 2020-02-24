import * as types from 'constants/actionTypes'
import {
	updateSpinner,
	addToast,
	handleAfterValidation,
	validate,
	updateAccountIdentityData,
	validateEthAddress,
	validatePrivilegesAddress,
	validatePrivLevel,
	validateWithdrawAmount,
} from 'actions'
import {
	selectNewTransactionById,
	selectWalletAddress,
	selectAuthType,
	selectAccount,
	selectAccountStatsFormatted,
	selectAccountStatsRaw,
	selectMainToken,
} from 'selectors'
import { getErrorMsg } from 'helpers/errors'

import { withdrawFromIdentity } from 'services/smart-contracts/actions/identity'

// MEMORY STORAGE
export function updateNewTransaction({ tx, key, value }) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_NEW_TRANSACTION,
			tx: tx,
			key: key,
			value: value,
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

// PERSIST STORAGE
export function addWeb3Transaction({ tx, addr }) {
	return function(dispatch) {
		if (!tx || !tx.hash || !addr) return

		return dispatch({
			type: types.ADD_WEB3_TRANSACTION,
			value: tx,
			tx: tx.hash,
			addr: addr,
		})
	}
}

// TODO: make update multiple
export function updateWeb3Transaction({ tx, key, value, addr }) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_WEB3_TRANSACTION,
			tx: tx,
			key: key,
			value: value,
			addr: addr,
		})
	}
}

export function resetWeb3Transaction({ tx, addr }) {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_WEB3_TRANSACTION,
			tx: tx,
			addr: addr,
		})
	}
}

export function validatePrivilegesChange({
	stepsId,
	validateId,
	txId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		await updateAccountIdentityData()(dispatch, getState)

		const state = getState()
		const { setAddr, warningAccepted, privLevel } = selectNewTransactionById(
			state,
			stepsId
		)
		const walletAddr = selectWalletAddress(state)
		const authType = selectAuthType(state)

		const inputValidations = await Promise.all([
			validateEthAddress({
				validateId,
				addr: setAddr,
				prop: 'setAddr',
				nonERC20: true,
				nonZeroAddr: true,
				authType,
				dirty,
			})(dispatch),
			validatePrivLevel({
				validateId,
				privLevel,
				dirty,
			})(dispatch),
		])

		let isValid = inputValidations.every(v => v === true)

		if (isValid) {
			const validation = await validatePrivilegesAddress({
				validateId,
				setAddr,
				walletAddr,
				warningAccepted,
				privLevel,
				dirty,
				authType,
			})(dispatch)

			isValid = validation.isValid

			await updateNewTransaction({
				tx: stepsId,
				key: 'warningMsg',
				value: validation.msg,
			})(dispatch)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function validateIdentityWithdraw({
	stepsId,
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		await updateAccountIdentityData()(dispatch, getState)

		const state = getState()
		const account = selectAccount(state)
		const { symbol, decimals } = selectMainToken(state)
		const { amountToWithdraw, withdrawTo } = selectNewTransactionById(
			state,
			stepsId
		)
		const {
			availableIdentityBalanceMainToken: availableIdentityBalanceMainTokenRaw,
		} = selectAccountStatsRaw(state)
		const {
			availableIdentityBalanceMainToken: availableIdentityBalanceMainTokenFormatted,
		} = selectAccountStatsFormatted(state)

		// const walletAddr = selectWalletAddress(state)
		const authType = selectAuthType(state)

		const inputValidations = await Promise.all([
			validateEthAddress({
				validateId,
				addr: withdrawTo,
				prop: 'withdrawTo',
				nonERC20: true,
				nonZeroAddr: true,
				authType,
				dirty,
			})(dispatch),
			validateWithdrawAmount({
				validateId,
				amountToWithdraw,
				availableIdentityBalanceMainTokenRaw,
				availableIdentityBalanceMainTokenFormatted,
				decimals,
				symbol,
				dirty,
			})(dispatch),
		])

		let isValid = inputValidations.every(v => v === true)

		if (isValid) {
			try {
				const feesData = await withdrawFromIdentity({
					account,
					amountToWithdraw,
					withdrawTo,
					getFeesOnly: true,
				})

				await updateNewTransaction({
					tx: stepsId,
					key: 'feesData',
					value: feesData,
				})(dispatch, getState)
			} catch (err) {
				isValid = false

				await validateWithdrawAmount({
					validateId,
					amountToWithdraw,
					availableIdentityBalanceMainTokenRaw,
					availableIdentityBalanceMainTokenFormatted,
					decimals,
					symbol,
					errorMsg: getErrorMsg(err),
					dirty,
				})(dispatch)
			}
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })

		await updateSpinner(validateId, false)(dispatch)
	}
}

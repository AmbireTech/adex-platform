import * as types from 'constants/actionTypes'
import {
	updateSpinner,
	handleAfterValidation,
	updateAccountIdentityData,
	validateEthAddress,
	validatePrivilegesAddress,
	validatePrivLevel,
	validateWithdrawAmount,
	addToast,
	validateFees,
} from 'actions'
import {
	selectNewTransactionById,
	selectWalletAddress,
	selectAuthType,
	selectAccount,
	selectAccountStatsFormatted,
	selectAccountStatsRaw,
	selectMainToken,
	selectGasPriceCap,
	t,
} from 'selectors'
import { getErrorMsg } from 'helpers/errors'
import { getGasPrice } from 'services/gas/actions'
import { formatUnits } from 'ethers/utils'
import {
	withdrawFromIdentity,
	setIdentityPrivilege,
} from 'services/smart-contracts/actions/identity'
import Helper from 'helpers/miscHelpers'

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

export function checkNetworkCongestion() {
	return async function(dispatch, getState) {
		const state = getState()
		const gasPriceCap = selectGasPriceCap(state)
		const gasPriceCapGwei = formatUnits(gasPriceCap, 'gwei')
		const authType = selectAuthType(state)
		const gasPrice = await getGasPrice(authType, 'gwei')
		if (+gasPriceCapGwei < +gasPrice) {
			addToast({
				type: 'warning',
				label: t('WARNING_NETWORK_CONGESTED'),
				timeout: 20000,
			})(dispatch)
		}
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
		const identityData = updateAccountIdentityData()(dispatch, getState)
		if (dirty) {
			await identityData
		}

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

		if (isValid) {
			const account = selectAccount(state)
			const feesData = await setIdentityPrivilege({
				privLevel,
				setAddr,
				getFeesOnly: true,
				account,
			})

			await updateNewTransaction({
				tx: stepsId,
				key: 'feesData',
				value: feesData,
			})(dispatch, getState)

			const { symbol, decimals } = selectMainToken(state)
			const {
				availableIdentityBalanceMainToken: availableIdentityBalanceMainTokenRaw,
			} = selectAccountStatsRaw(state)
			const {
				availableIdentityBalanceMainToken: availableIdentityBalanceMainTokenFormatted,
			} = selectAccountStatsFormatted(state)

			isValid = await validateFees({
				validateId,
				feesAmountBN: feesData.feesBn,
				availableIdentityBalanceMainTokenRaw,
				amountToSpendBN: '0',
				availableIdentityBalanceMainTokenFormatted,
				decimals,
				symbol,
				dirty,
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

export function completeTx({
	stepsId,
	competeFn,
	validateId,
	dirty,
	onValid,
	onInvalid,
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

			const account = selectAccount(state)
			const transaction = selectNewTransactionById(state, stepsId)(
				dispatch,
				getState
			)

			await competeFn({ ...transaction, account })
			isValid = true
		} catch (err) {
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
	}
}

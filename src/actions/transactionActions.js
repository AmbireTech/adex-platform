import * as types from 'constants/actionTypes'
import {
	updateSpinner,
	handleAfterValidation,
	validateEthAddress,
	validatePrivilegesAddress,
	validatePrivLevel,
	validateWithdrawAmount,
	addToast,
	validateFees,
	validateENS,
	validateNumberString,
	beforeWeb3,
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
import { utils } from 'ethers'
import {
	withdrawFromIdentity,
	setIdentityPrivilege,
	addIdentityENS,
	withdrawOtherTokensFromIdentity,
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

export function checkNetworkCongestion(showToast) {
	return async function(dispatch, getState) {
		const state = getState()
		const gasPriceCap = selectGasPriceCap(state)
		const gasPriceCapGwei = utils.formatUnits(gasPriceCap, 'gwei')
		const gasPrice = await getGasPrice('gwei')
		if (+gasPriceCapGwei < +gasPrice) {
			if (showToast) {
				addToast({
					type: 'warning',
					label: t('WARNING_NETWORK_CONGESTED'),
					timeout: 20000,
				})(dispatch)
			}

			return t('WARNING_NETWORK_CONGESTED')
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
		if (!dirty) {
			await beforeWeb3(validateId)(dispatch, getState)
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
				quickCheck: !dirty,
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

			isValid = await validateFees({
				validateId,
				feesAmountBN: feesData.totalBN,
				amountToSpendBN: '0',
				dirty,
			})(dispatch, getState)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function updateIdentityPrivilege({ setAddr, privLevel }) {
	return async function(dispatch, getState) {
		try {
			const account = selectAccount(getState())
			const result = await setIdentityPrivilege({
				account,
				setAddr,
				privLevel,
			})
			addToast({
				type: 'accept',
				label: t('IDENTITY_SET_ADDR_PRIV_NOTIFICATION', {
					args: [result],
				}),
				timeout: 20000,
			})
		} catch (err) {
			console.error('ERR_IDENTITY_SET_ADDR_PRIV_NOTIFICATION', err)
			addToast({
				type: 'cancel',
				label: t('ERR_IDENTITY_SET_ADDR_PRIV_NOTIFICATION', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
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
		if (!dirty) {
			await beforeWeb3(validateId)(dispatch, getState)
		}
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
				quickCheck: !dirty,
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

		let feesData = null

		if (isValid) {
			try {
				feesData = await withdrawFromIdentity({
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

				isValid = await validateFees({
					validateId,
					feesAmountBN: feesData.totalBN,
					amountToSpendBN: feesData.actualWithdrawAmount,
					dirty,
				})(dispatch, getState)
			} catch (err) {
				console.error('validateIdentityWithdraw', err)

				isValid = false
			}
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function validateIdentityWithdrawAny({
	stepsId,
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		if (!dirty) {
			await beforeWeb3(validateId)(dispatch, getState)
		}
		const state = getState()
		const account = selectAccount(state)
		const {
			amountToWithdraw,
			withdrawTo,
			tokenAddress,
			tokenDecimals,
		} = selectNewTransactionById(state, stepsId)
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
				quickCheck: !dirty,
			})(dispatch),
			validateEthAddress({
				validateId,
				addr: tokenAddress,
				prop: 'tokenAddress',
				nonERC20: false,
				nonZeroAddr: true,
				authType,
				dirty,
				quickCheck: !dirty,
			})(dispatch),
			validateNumberString({
				validateId,
				prop: 'amountToWithdraw',
				value: amountToWithdraw,
				dirty,
			})(dispatch),
			validateNumberString({
				validateId,
				prop: 'tokenDecimals',
				value: tokenDecimals,
				integerOnly: true,
				dirty,
			})(dispatch),
		])

		let isValid = inputValidations.every(v => v === true)

		let feesData = null

		if (isValid) {
			try {
				feesData = await withdrawOtherTokensFromIdentity({
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

				isValid = await validateFees({
					validateId,
					feesAmountBN: feesData.totalBN,
					amountToSpendBN: feesData.actualWithdrawAmount,
					dirty,
				})(dispatch, getState)
			} catch (err) {
				console.error('validateIdentityWithdrawAny', err)
				isValid = false
			}
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function identityWithdrawAny({
	amountToWithdraw,
	withdrawTo,
	tokenAddress,
	tokenDecimals,
}) {
	return async function(dispatch, getState) {
		try {
			const account = selectAccount(getState())
			const result = await withdrawOtherTokensFromIdentity({
				account,
				amountToWithdraw,
				withdrawTo,
				tokenAddress,
				tokenDecimals,
			})

			addToast({
				type: 'accept',
				label: t('IDENTITY_WITHDRAW_NOTIFICATION', { args: [result] }),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_IDENTITY_WITHDRAW_NOTIFICATION', err)
			addToast({
				type: 'cancel',
				label: t('ERR_IDENTITY_WITHDRAW_NOTIFICATION', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function identityWithdraw({ amountToWithdraw, withdrawTo }) {
	return async function(dispatch, getState) {
		try {
			const account = selectAccount(getState())
			const result = await withdrawFromIdentity({
				account,
				amountToWithdraw,
				withdrawTo,
			})
			addToast({
				type: 'accept',
				label: t('IDENTITY_WITHDRAW_NOTIFICATION', {
					args: [result],
				}),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_IDENTITY_WITHDRAW_NOTIFICATION', err)
			addToast({
				type: 'cancel',
				label: t('ERR_IDENTITY_WITHDRAW_NOTIFICATION', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function validateENSChange({
	stepsId,
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		if (!dirty) {
			await beforeWeb3(validateId)(dispatch, getState)
		}
		const state = getState()
		const { username } = selectNewTransactionById(state, stepsId)

		const inputValidations = await Promise.all([
			validateENS({
				validateId,
				username,
				dirty,
			})(dispatch),
		])

		let isValid = inputValidations.every(v => v === true)

		if (isValid) {
			const account = selectAccount(state)
			const feesData = await addIdentityENS({
				getFeesOnly: true,
				account,
			})

			await updateNewTransaction({
				tx: stepsId,
				key: 'feesData',
				value: feesData,
			})(dispatch, getState)

			isValid = await validateFees({
				validateId,
				feesAmountBN: feesData.totalBN,
				amountToSpendBN: '0',
				dirty,
			})(dispatch, getState)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function setIdentityENS({ username }) {
	return async function(dispatch, getState) {
		try {
			const account = selectAccount(getState())
			await addIdentityENS({
				username,
				account,
			})

			addToast({
				type: 'accept',
				label: t('ENS_SETUP_NOTIFICATION', { args: [username] }),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_SETTING_ENS', err)
			addToast({
				type: 'cancel',
				label: t('ERR_SETTING_ENS', {
					args: [err],
				}),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function completeTx({
	stepsId,
	competeAction,
	validateId,
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

			const transaction = selectNewTransactionById(state, stepsId)

			await competeAction({ ...transaction })(dispatch, getState)
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

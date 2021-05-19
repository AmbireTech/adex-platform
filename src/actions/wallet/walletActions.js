// import * as types from 'constants/actionTypes'
import { getErrorMsg } from 'helpers/errors'
import {
	updateSpinner,
	handleAfterValidation,
	validateNumberString,
	beforeWeb3,
	addToast,
	updateNewTransaction,
	validateWalletFees,
	validate,
} from 'actions'
import {
	selectNewTransactionById,
	selectAccount,
	selectAuthType,
	t,
} from 'selectors'
import { BigNumber } from 'ethers'
import { walletTradeTransaction } from 'services/smart-contracts/actions/wallet'

export function handleWalletFeesData({
	stepsId,
	validateId,
	dirty,
	actionName,
	feeDataAction,
}) {
	return async function(dispatch, getState) {
		let isValid = false
		try {
			const feesData = await feeDataAction()

			await updateNewTransaction({
				tx: stepsId,
				key: 'feesData',
				value: feesData,
			})(dispatch, getState)

			isValid = await validateWalletFees({
				validateId,
				feesAmountBN: feesData.feesAmountBN,
				feeTokenAddr: feesData.feeTokenAddr,
				spendAsset: feesData.spendAsset,
				amountToSpendBN: feesData.amountToSpendBN || '0',
				dirty,
			})(dispatch, getState)
		} catch (err) {
			console.error(actionName, err)

			isValid = false
			await validate(validateId, 'fees', {
				isValid,
				err: { msg: getErrorMsg(err) },
				dirty,
			})(dispatch, getState)
		}

		return isValid
	}
}

export function validateWalletTrade({
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
		// const account = selectAccount(state)
		const {
			formAsset,
			formAssetAmount,
			toAsset,
			toAssetAmount,
		} = selectNewTransactionById(state, stepsId)

		// const authType = selectAuthType(state)

		const inputValidations = await Promise.all([
			validateNumberString({
				validateId,
				prop: 'formAssetAmount',
				value: formAssetAmount,
				dirty,
			})(dispatch),
			validateNumberString({
				validateId,
				prop: 'toAssetAmount',
				value: toAssetAmount,
				dirty,
			})(dispatch),
		])

		let isValid = inputValidations.every(v => v === true)

		if (isValid) {
			const account = selectAccount(state)
			const feeDataAction = async () =>
				await walletTradeTransaction({
					getFeesOnly: true,
					account,
					formAsset,
					formAssetAmount,
					toAsset,
					toAssetAmount,
				})

			isValid = await handleWalletFeesData({
				stepsId,
				validateId,
				dirty,
				actionName: 'walletTrade',
				feeDataAction,
			})(dispatch, getState)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function walletTrade({
	test,
	getFeesOnly,
	formAsset,
	formAssetAmount,
	toAsset,
	toAssetAmount,
}) {
	return async function(dispatch, getState) {
		try {
			const state = getState()
			const account = selectAccount(state)
			const authType = selectAuthType(state)
			const result = await walletTradeTransaction({
				account,
				authType,
				formAsset,
				formAssetAmount,
				toAsset,
				toAssetAmount,
			})

			addToast({
				type: 'accept',
				label: t('WALLET_TRADE_TRANSACTION_SUCCESS', {
					args: [result],
				}),
				timeout: 20000,
			})(dispatch)
		} catch {
			// TODO
		}
	}
}

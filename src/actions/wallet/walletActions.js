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
	// selectAccount,
	t,
} from 'selectors'
import { BigNumber } from 'ethers'

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
				feeAsset: feesData.feeAsset,
				spendAsset: feesData.spendAsset,
				amountToSpendBN: feesData.actualWithdrawAmount || '0',
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
			// toAssetAmount,
		} = selectNewTransactionById(state, stepsId)

		// const authType = selectAuthType(state)

		const inputValidations = await Promise.all([
			validateNumberString({
				validateId,
				prop: 'formAssetAmount',
				value: formAssetAmount,
				dirty,
			})(dispatch),
		])

		let isValid = inputValidations.every(v => v === true)

		if (isValid) {
			isValid = await handleWalletFeesData({
				stepsId,
				validateId,
				dirty,
				actionName: 'walletTrade',
				feeDataAction: async () => {
					// TODO
					return {
						total: '1',
						feesAmountBN: BigNumber.from(1),
						feeAsset: formAsset,
						spendAsset: formAsset,
						amountToSpendBN: formAssetAmount,
						breakdownFormatted: {
							feeAmount: '1',
						},
					}
				},
			})(dispatch, getState)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function walletTrade({
	test,
	// formAsset,
	// formAssetAmount,
	// toAsset,
	// toAssetAmount,
}) {
	return async function(dispatch, getState) {
		try {
			// const account = selectAccount(getState())
			// const result = await walletTradeTransaction({
			// 	account,
			// 	amountToWithdraw,
			// 	withdrawTo,
			// })

			const result = 'tx-ID-....TODO'
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
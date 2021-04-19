// import * as types from 'constants/actionTypes'
import {
	updateSpinner,
	handleAfterValidation,
	validateNumberString,
	beforeWeb3,
	addToast,
	handleFeesData,
} from 'actions'
import {
	selectNewTransactionById,
	// selectAccount,
	t,
} from 'selectors'
import { BigNumber } from 'ethers'

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
			// formAsset,
			formAssetAmount,
			toAsset,
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
			validateNumberString({
				validateId,
				prop: 'toAsset',
				value: toAsset,
				dirty,
			})(dispatch),
		])

		let isValid = inputValidations.every(v => v === true)

		if (isValid) {
			isValid = await handleFeesData({
				stepsId,
				validateId,
				dirty,
				actionName: 'walletTrade',
				feeDataAction: () => {
					// TODO
					return {
						total: '1',
						totalBN: BigNumber.from(1),
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

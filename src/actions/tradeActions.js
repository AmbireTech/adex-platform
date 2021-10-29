import {
	updateSpinner,
	handleAfterValidation,
	validateNumberString,
	beforeWeb3,
	addToast,
	updateNewTransaction,
	validateEthAddress,
	validateActionInputAmount,
	handleWalletTxnsAndFeesData,
} from 'actions'
import {
	selectNewTransactionById,
	selectAccount,
	selectAuthType,
	t,
	selectAccountStatsRaw,
	selectWallet,
	selectAccountIdentityAddr,
} from 'selectors'
import { walletTradeTransaction } from 'services/smart-contracts/actions/wallet'
import { getTradeOutData } from 'services/smart-contracts/actions/walletCommon'
import { processExecuteWalletTxns } from 'services/smart-contracts/actions/walletIdentity'
import { getEthers } from 'services/smart-contracts/ethers'

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
		const { assetsData: assetsDataRaw = {} } = selectAccountStatsRaw(state)
		// const account = selectAccount(state)
		const {
			fromAsset,
			fromAssetAmount,
			toAsset,
			toAssetAmount,
			lendOutputToAAVE,
		} = selectNewTransactionById(state, stepsId)

		// const authType = selectAuthType(state)

		const inputValidations = await Promise.all([
			validateNumberString({
				validateId,
				prop: 'fromAssetAmount',
				value: fromAssetAmount,
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
			isValid = await validateActionInputAmount({
				validateId,
				prop: 'fromAssetAmount',
				value: fromAssetAmount,
				inputTokenAddr: fromAsset,
				dirty,
			})(dispatch, getState)
		}

		if (isValid) {
			const account = selectAccount(state)
			// We get txns and data here
			const feeDataAction = async () =>
				await walletTradeTransaction({
					account,
					fromAsset,
					fromAssetAmount,
					toAsset,
					toAssetAmount,
					lendOutputToAAVE,
					assetsDataRaw,
				})

			isValid = await handleWalletTxnsAndFeesData({
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
	// test,
	// getFeesOnly,
	// fromAsset,
	// fromAssetAmount,
	// toAsset,
	// toAssetAmount,
	// lendOutputToAAVE,
	feesData = {}, // TODO: txnsData etc...
}) {
	return async function(dispatch, getState) {
		try {
			const state = getState()
			const authType = selectAuthType(state)
			const wallet = selectWallet(state)
			const { provider } = await getEthers(authType)
			const identityAddr = selectAccountIdentityAddr(state)
			const { txnsWithNonceAndFees } = feesData

			const result = await processExecuteWalletTxns({
				identityAddr,
				txnsWithNonceAndFees,
				wallet,
				provider,
			})

			addToast({
				type: 'accept',
				label: t('WALLET_TRADE_TRANSACTION_SUCCESS', {
					args: [result],
				}),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_WALLET_TRADE', err)
			addToast({
				type: 'cancel',
				label: t('ERR_WALLET_TRADE', {
					args: [err.message],
				}),
				timeout: 5000,
			})(dispatch)
		}
	}
}

export function updateEstimatedTradeValue({
	stepsId,
	validateId,
	dirty,
	// onValid,
	// onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		const state = getState()
		try {
			const { fromAsset, fromAssetAmount, toAsset } = selectNewTransactionById(
				state,
				stepsId
			)

			if (!fromAsset || !toAsset) {
				return
			}

			const inputValidations = await Promise.all([
				validateNumberString({
					validateId,
					prop: 'fromAssetAmount',
					value: fromAssetAmount,
					dirty,
				})(dispatch),
				validateEthAddress({
					validateId,
					prop: 'fromAsset',
					addr: fromAsset,
					quickCheck: true,
					dirty,
				})(dispatch),
				validateEthAddress({
					validateId,
					prop: 'toAsset',
					addr: toAsset,
					quickCheck: true,
					dirty,
				})(dispatch),
			])

			let isValid = inputValidations.every(v => v === true)

			if (isValid) {
				const isZeroAmount =
					!fromAssetAmount || parseFloat(fromAssetAmount) === 0
				const tradeData = isZeroAmount
					? undefined
					: await getTradeOutData({
							fromAsset,
							fromAssetAmount,
							toAsset,
					  })

				await updateNewTransaction({
					tx: stepsId,
					key: 'toAssetAmount',
					value: tradeData ? tradeData.expectedAmountOut : '0',
				})(dispatch, getState)

				await updateNewTransaction({
					tx: stepsId,
					key: 'tradeData',
					value: tradeData,
				})(dispatch, getState)
			}
		} catch (err) {
			console.error('ERR_WALLET_TRADE_DATA', err)
			addToast({
				type: 'cancel',
				label: t('ERR_WALLET_TRADE_DATA', {
					args: [err.message],
				}),
				timeout: 5000,
			})(dispatch)
		}

		await updateSpinner(validateId, false)(dispatch)
	}
}

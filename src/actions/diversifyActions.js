import {
	updateSpinner,
	handleAfterValidation,
	validateNumberString,
	beforeWeb3,
	addToast,
	validateWalletDiversificationAssets,
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
import { walletDiversificationTransaction } from 'services/smart-contracts/actions/walletTrade'
import { processExecuteWalletTxns } from 'services/smart-contracts/actions/walletIdentity'
import { getEthers } from 'services/smart-contracts/ethers'

export function validateWalletDiversify({
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
			fromAsset,
			fromAssetAmount,
			diversificationAssets,
		} = selectNewTransactionById(state, stepsId)
		const { assetsData: assetsDataRaw = {} } = selectAccountStatsRaw(state)

		// const authType = selectAuthType(state)

		const inputValidations = await Promise.all([
			validateNumberString({
				validateId,
				prop: 'fromAssetAmount',
				value: fromAssetAmount,
				dirty,
			})(dispatch),
			validateWalletDiversificationAssets({
				validateId,
				diversificationAssets,
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
			const feeDataAction = async () =>
				await walletDiversificationTransaction({
					account,
					fromAsset,
					fromAssetAmount,
					diversificationAssets,
					assetsDataRaw,
				})

			isValid = await handleWalletTxnsAndFeesData({
				stepsId,
				validateId,
				dirty,
				actionName: 'walletDiversify',
				feeDataAction,
			})(dispatch, getState)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

export function walletDiversification({
	// fromAsset,
	// fromAssetAmount,
	// diversificationAssets,
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
				label: t('WALLET_DIVERSIFICATION_TRADE_TRANSACTION_SUCCESS', {
					args: [result],
				}),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			addToast({
				type: 'cancel',
				label: t('ERR_WALLET_DIVERSIFICATION_TRADE', {
					args: [err.message],
				}),
				timeout: 5000,
			})(dispatch)
		}
	}
}

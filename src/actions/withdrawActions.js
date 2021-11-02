import {
	updateSpinner,
	handleAfterValidation,
	validateNumberString,
	beforeWeb3,
	addToast,
	validate,
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
	selectValidationsById,
} from 'selectors'
import {
	walletWithdrawTransaction,
	walletWithdrawMultipleTransaction,
} from 'services/smart-contracts/actions/walletWithdraw'

// import {
// 	getSigner,
// 	getMultipleTxSignatures,
// } from 'services/smart-contracts/actions/ethers'
const ADEX_RELAYER_HOST = process.env.ADEX_RELAYER_HOST

function checkStepId({ stepsId, functionName }) {
	if (!stepsId) {
		throw new Error('No steps id provided - ' + functionName)
	}
}

export function validateWalletWithdraw({
	stepsId,
	validateId,
	dirty,
	onValid,
	onInvalid,
	stepsProps = {},
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
			temp,
			txSpeed,
			feeTokenAddr,
		} = selectNewTransactionById(state, stepsId)
		const { assetsData = {} } = selectAccountStatsRaw(state)
		const { withdrawAsset } = stepsProps
		const { decimals: tokenDecimals } = assetsData[withdrawAsset]
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
				addr: withdrawAsset,
				prop: 'withdrawAsset',
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

		if (isValid) {
			isValid = await validateActionInputAmount({
				validateId,
				prop: 'amountToWithdraw',
				value: amountToWithdraw,
				inputTokenAddr: withdrawAsset,
				dirty,
			})(dispatch, getState)
		}

		if (isValid) {
			const feeDataAction = async () =>
				await walletWithdrawTransaction({
					account,
					amountToWithdraw,
					withdrawTo,
					withdrawAssetAddr: withdrawAsset,
					assetsDataRaw: assetsData,
					txSpeed,
					feeTokenAddr,
				})

			isValid = await handleWalletTxnsAndFeesData({
				stepsId,
				validateId,
				dirty,
				actionName: 'walletWithdraw',
				feeDataAction,
				temp,
			})(dispatch, getState)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

export function validateWalletWithdrawMultiple({
	stepsId,
	validateId,
	dirty,
	onValid,
	onInvalid,
	stepsProps = {},
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		if (!dirty) {
			await beforeWeb3(validateId)(dispatch, getState)
		}
		const state = getState()
		const account = selectAccount(state)
		const {
			withdrawAssets = [],
			feeTokenAddr,
			withdrawTo,
			temp,
		} = selectNewTransactionById(state, stepsId)
		const { assetsData = {} } = selectAccountStatsRaw(state)
		const authType = selectAuthType(state)

		// TEMP: reset all validations - because of removed assets

		const validations = selectValidationsById(state, validateId) || {}
		const validationsToReset = Object.keys(validations).filter(key =>
			['withdrawAsset', 'amountToWithdraw', 'tokenDecimals'].some(x =>
				key.startsWith(x)
			)
		)

		await Promise.all(
			validationsToReset.map(prop =>
				validate(validateId, prop, {
					isValid: true,
				})(dispatch)
			)
		)

		const withdrawValidations = withdrawAssets
			.map(({ address, amount }) => {
				const { decimals, symbol } = assetsData[address]
				return [
					validateEthAddress({
						validateId,
						addr: address,
						prop: `withdrawAsset-${symbol}`,
						nonERC20: false,
						nonZeroAddr: true,
						authType,
						dirty,
						quickCheck: !dirty,
					})(dispatch),
					validateNumberString({
						validateId,
						prop: `${symbol}`,
						value: amount,
						dirty,
					})(dispatch),
					validateNumberString({
						validateId,
						prop: `tokenDecimals-${symbol}`,
						value: decimals,
						integerOnly: true,
						dirty,
					})(dispatch),
				]
			})
			.reduce((all, forAsset) => [...all, ...forAsset], [])

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
				addr: feeTokenAddr,
				prop: `feeTokenAddr-${feeTokenAddr}`,
				nonERC20: false,
				nonZeroAddr: true,
				authType,
				dirty,
				quickCheck: !dirty,
				errMsg: 'FEE_TOKEN_NOT_SELECTED',
			})(dispatch),
			...withdrawValidations,
		])

		let isValid = inputValidations.every(v => v === true)

		if (isValid) {
			const inputAmoutValidations = await Promise.all(
				withdrawAssets.map(({ address, amount }) => {
					const { symbol } = assetsData[address]
					return validateActionInputAmount({
						validateId,
						prop: `${symbol}`,
						value: amount,
						inputTokenAddr: address,
						dirty,
					})(dispatch, getState)
				})
			)
			isValid = inputAmoutValidations.every(v => v === true)
		}

		if (isValid) {
			const feeDataAction = async () =>
				await walletWithdrawMultipleTransaction({
					account,
					withdrawTo,
					withdrawAssets,
					feeTokenAddr: feeTokenAddr || withdrawAssets[0].address,
					assetsDataRaw: assetsData,
				})

			isValid = await handleWalletTxnsAndFeesData({
				stepsId,
				validateId,
				dirty,
				actionName: 'walletWithdraw',
				feeDataAction,
				temp,
			})(dispatch, getState)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

export function walletWithdraw({
	stepsId,
	// validateId,
	// dirty,
	// onValid,
	// onInvalid,
	// stepsProps = {},
	// amountToWithdraw,
	// withdrawTo,
	feesData = {},
}) {
	return async function(dispatch, getState) {
		try {
			checkStepId({ stepsId, functionName: 'walletWithdraw' })
			const { bundle } = feesData

			// TODO: bundle submit handler - catch errors
			// and success msgs

			const result = await bundle.submit({
				fetch,
				relayerURL: ADEX_RELAYER_HOST,
			})

			addToast({
				type: 'accept',
				label: t('WALLET_WITHDRAW_TRANSACTION_SUCCESS', {
					args: [result],
				}),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error(err)
			addToast({
				type: 'cancel',
				label: t('ERR_WALLET_WITHDRAW_TRADE', {
					args: [err.message],
				}),
				timeout: 5000,
			})(dispatch)
		}
	}
}

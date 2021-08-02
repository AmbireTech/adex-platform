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
	validateWalletDiversificationAssets,
	validateEthAddress,
	validatePrivLevel,
	validatePrivilegesAddress,
	validateActionInputAmount,
} from 'actions'
import {
	selectNewTransactionById,
	selectAccount,
	selectAuthType,
	selectWalletAddress,
	t,
	selectAccountStatsRaw,
	selectWallet,
	selectAccountIdentityAddr,
} from 'selectors'
import {
	walletTradeTransaction,
	getTradeOutData,
	walletDiversificationTransaction,
	walletWithdrawTransaction,
	walletSetIdentityPrivilege,
} from 'services/smart-contracts/actions/wallet'
import { processExecuteWalletTxns } from 'services/smart-contracts/actions/walletIdentity'
import { getEthers } from 'services/smart-contracts/ethers'

function checkStepId({ stepsId, functionName }) {
	if (!stepsId) {
		throw new Error('No steps id provided - ' + functionName)
	}
}

export function handleWalletTxnsAndFeesData({
	stepsId,
	validateId,
	dirty,
	actionName,
	feeDataAction,
	temp,
}) {
	return async function(dispatch, getState) {
		let isValid = false
		try {
			const feesData = await feeDataAction()

			isValid = await validateWalletFees({
				validateId,
				...feesData,
				dirty,
			})(dispatch, getState)

			// TODO: rename feesData to txnsData, and feesData to be prop of txnsData
			// temp txnsWithNonceAndFees is prop of feesData
			await updateNewTransaction({
				tx: stepsId,
				key: 'feesData',
				value: feesData,
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
				const isZeroAmount = !fromAssetAmount || fromAssetAmount === '0'
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
		const { amountToWithdraw, withdrawTo, temp } = selectNewTransactionById(
			state,
			stepsId
		)
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

export function walletValidatePrivilegesChange({
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
			isValid = await handleWalletTxnsAndFeesData({
				stepsId,
				validateId,
				dirty,
				actionName: 'validatePrivilegesChange',
				feeDataAction: () =>
					walletSetIdentityPrivilege({
						privLevel,
						setAddr,
						getFeesOnly: true,
						account,
					}),
			})(dispatch, getState)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function walletUpdateIdentityPrivilege({ setAddr, privLevel }) {
	return async function(dispatch, getState) {
		try {
			const account = selectAccount(getState())
			const result = await walletSetIdentityPrivilege({
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

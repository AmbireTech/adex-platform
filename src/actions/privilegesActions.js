import { getErrorMsg } from 'helpers/errors'
import {
	updateSpinner,
	handleAfterValidation,
	beforeWeb3,
	addToast,
	updateNewTransaction,
	validateEthAddress,
	validateWalletPrivLevel,
	validatePrivilegesAddress,
	validateWalletFeeTokens,
	handleWalletTxnsAndFeesData,
} from 'actions'
import {
	selectNewTransactionById,
	selectAccount,
	selectAuthType,
	selectWalletAddress,
	t,
} from 'selectors'
import { walletSetIdentityPrivilege } from 'services/smart-contracts/actions/wallet'

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
		const {
			setAddr,
			warningAccepted,
			privLevel,
			feeTokenAddr,
		} = selectNewTransactionById(state, stepsId)
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
			validateWalletPrivLevel({
				validateId,
				privLevel,
				dirty,
			})(dispatch),
			validateWalletFeeTokens({
				validateId,
				feeTokenAddr,
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

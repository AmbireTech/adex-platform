import * as types from 'constants/actionTypes'
import { validEthAddress, freeAdExENS } from '../helpers/validators'
import { translate } from 'services/translations/translations'
import { addToast, updateSpinner } from './uiActions'
import { BigNumber, utils } from 'ethers'
import { validations, Joi, schemas, constants, helpers } from 'adex-models'
import { validPassword } from 'helpers/validators'
import {
	t,
	selectAuthType,
	selectAccountStatsRaw,
	selectAccountStatsFormatted,
	selectMainToken,
} from 'selectors'
import { getErrorMsg } from 'helpers/errors'
import { getEmail } from 'services/adex-relayer/actions'
import { formatTokenAmount } from 'helpers/formatters'
const { IdentityPrivilegeLevel, CountryTiers, OsGroups } = constants
const { bondPerActionToUserInputPerMileValue } = helpers

const { campaignPut, account } = schemas
const { isNumberString } = validations

export function validateAddress({ addr, dirty, validate, name, nonERC20 }) {
	return async function(dispatch, getState) {
		const authType = selectAuthType(getState())
		try {
			if (validate) validate(name, { isValid: false })
			updateSpinner(name, dirty)(dispatch)
			const { msg } = await validEthAddress({
				addr,
				nonZeroAddr: true,
				nonERC20,
				authType,
			})
			const isValid = !msg

			if (validate) {
				validate(name, { isValid: isValid, err: { msg: msg }, dirty: dirty })
			}
		} catch (err) {
			console.error('ERR_VALIDATING_ETH_ADDRESS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_VALIDATING_ETH_ADDRESS', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner(name, false)(dispatch)
	}
}

export function updateValidationErrors(item, newErrors) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_ITEM_VALIDATION,
			item,
			errors: newErrors,
		})
	}
}

export function resetValidationErrors(item, key) {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_ITEM_VALIDATION,
			item,
			key,
		})
	}
}

export function validate(
	validateId,
	key,
	{
		isValid,
		err = { msg: '', args: [], fields: {} },
		dirty = false,
		removeAll = false,
	}
) {
	return async function(dispatch, getState) {
		if (!isValid) {
			let errors = {}
			errors[key] = {
				errMsg: t(err.msg, { args: err.args }),
				errFields: err.fields,
				dirty,
			}

			updateValidationErrors(validateId, errors)(dispatch)
		} else if (removeAll) {
			resetValidationErrors(validateId)(dispatch)
		} else {
			resetValidationErrors(validateId, key)(dispatch)
		}

		return isValid
	}
}

export const handleAfterValidation = async ({
	isValid,
	onValid,
	onInvalid,
}) => {
	if (isValid && typeof onValid === 'function') {
		await onValid()
	}
	if (!isValid && typeof onInvalid === 'function') {
		await onInvalid()
	}
}

export function validateEmailCheck(validateId, emailCheck, email, dirty) {
	return async function(dispatch, getState) {
		const isValid = !!emailCheck && !!email && emailCheck === email
		validate(validateId, 'emailCheck', {
			isValid,
			err: { msg: 'ERR_EMAIL_CHECK' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validatePassword(validateId, password, dirty) {
	return async function(dispatch, getState) {
		const isValid = validPassword(password)
		validate(validateId, 'password', {
			isValid,
			err: { msg: 'ERR_PASSWORD' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validatePasswordCheck(
	validateId,
	passwordCheck,
	password,
	dirty
) {
	return async function(dispatch, getState) {
		const isValid = !!passwordCheck && !!password && passwordCheck === password
		validate(validateId, 'passwordCheck', {
			isValid,
			err: { msg: 'ERR_PASSWORD_CHECK' },
			dirty: dirty,
		})(dispatch)

		return isValid
	}
}

export function validateTOS(validateId, accepted, dirty) {
	return async function(dispatch, getState) {
		const isValid = !!accepted
		validate(validateId, 'tosCheck', {
			isValid,
			err: { msg: 'ERR_TOS_CHECK' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateENS({ username, dirty, validateId }) {
	return async function(dispatch) {
		let msg = !username
			? 'ERR_NO_ENS_USERNAME_PROVIDED'
			: /^([a-z0-9]+)$/.test(username)
			? null
			: 'ERR_INVALID_ENS_USER_NAME'

		if (!msg) {
			msg = (
				await freeAdExENS({
					username,
				})
			).msg
		}

		const isValid = !msg
		validate(validateId, 'username', {
			isValid,
			err: { msg },
			dirty,
		})(dispatch)

		return isValid
	}
}
export function validateWallet(validateId, wallet, dirty) {
	return async function(dispatch, getState) {
		const isValid = !!wallet && !!wallet.address
		validate(validateId, 'wallet', {
			isValid,
			err: { msg: 'ERR_NO_WALLET_SELECTED' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateIdentityContractOwner(
	validateId,
	identityContractOwner,
	dirty
) {
	return async function(dispatch, getState) {
		const isValid = !!identityContractOwner
		validate(validateId, 'identityContractOwner', {
			isValid,
			err: { msg: 'ERR_NO_IDENTITY_CONTRACT_OWNER' },
			dirty,
		})(dispatch)

		return isValid
	}
}
export function validateKnowFrom(validateId, knowFrom, dirty) {
	return async function(dispatch, getState) {
		const isValid = !!knowFrom
		validate(validateId, 'knowFrom', {
			isValid,
			err: { msg: 'ERR_WHERE_YOU_KNOW_US_DROPDOWN_CHECK' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateMoreInfo(validateId, knowFrom, moreInfo, dirty) {
	return async function(dispatch, getState) {
		const isValid =
			knowFrom === 'other' || knowFrom === 'event' ? !!moreInfo : true
		validate(validateId, 'moreInfo', {
			isValid,
			err: { msg: 'ERR_WHERE_YOU_KNOW_US_MOREINFO_CHECK' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateAccessWarning(validateId, accepted, dirty) {
	return async function(dispatch, getState) {
		const isValid = !!accepted
		validate(validateId, 'accessWarningCheck', {
			isValid,
			err: { msg: 'ERR_ACCESS_WARNING_CHECK' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateFees({
	validateId,
	feesAmountBN,
	amountToSpendBN,
	errorMsg = '',
	dirty,
}) {
	return async function(dispatch, getState) {
		let isValid = true
		let msg = errorMsg
		let args = []
		const state = getState()

		const {
			availableIdentityBalanceMainToken: availableIdentityBalanceMainTokenRaw,
		} = selectAccountStatsRaw(state)
		const {
			availableIdentityBalanceMainToken: availableIdentityBalanceMainTokenFormatted,
		} = selectAccountStatsFormatted(state)
		const amountNeeded = BigNumber.from(feesAmountBN).add(
			BigNumber.from(amountToSpendBN)
		)

		const { symbol, decimals } = selectMainToken(state)

		if (amountNeeded.gt(BigNumber.from(availableIdentityBalanceMainTokenRaw))) {
			const amountNeededFormatted = formatTokenAmount(
				amountNeeded,
				decimals,
				null,
				2
			)
			isValid = false
			msg = 'ERR_TX_INSUFFICIENT_BALANCE'
			args = [
				amountNeededFormatted,
				symbol,
				availableIdentityBalanceMainTokenFormatted,
				symbol,
			]
		}

		await validate(validateId, 'fees', {
			isValid,
			err: { msg, args },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateWithdrawAmount({
	validateId,
	amountToWithdraw,
	availableIdentityBalanceMainTokenRaw,
	availableIdentityBalanceMainTokenFormatted,
	decimals,
	symbol,
	dirty,
}) {
	return async function(dispatch) {
		let isValid = isNumberString(amountToWithdraw)

		let msg = 'ERR_INVALID_AMOUNT_VALUE'
		let args = []
		const amount = isValid ? utils.parseUnits(amountToWithdraw, decimals) : null
		if (isValid && amount.isZero()) {
			isValid = false
			msg = 'ERR_ZERO_WITHDRAW_AMOUNT'
		} else if (
			isValid &&
			amount.gt(BigNumber.from(availableIdentityBalanceMainTokenRaw))
		) {
			isValid = false
			msg = 'ERR_MAX_AMOUNT_TO_WITHDRAW'
			args = [availableIdentityBalanceMainTokenFormatted, symbol]
		}

		await validate(validateId, 'amountToWithdraw', {
			isValid,
			err: { msg, args },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateNumberString({
	validateId,
	prop,
	value,
	dirty,
	integerOnly,
}) {
	return async function(dispatch, getState) {
		let isValid = isNumberString(value)
		let msg = 'ERR_INVALID_AMOUNT'

		if (isValid && integerOnly) {
			const int = parseInt(value, 10)
			if (int.toString() !== value.toString()) {
				isValid = false
				msg = 'ERR_INVALID_INTEGER_NUMBER'
			}
		}

		validate(validateId, prop, {
			isValid,
			err: { msg, args: [value] },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateEthAddress({
	validateId,
	prop,
	addr,
	nonZeroAddr = true,
	nonERC20 = true,
	dirty,
	authType,
	quickCheck,
}) {
	return async function(dispatch, getState) {
		const { msg } = await validEthAddress({
			addr,
			nonZeroAddr,
			nonERC20,
			authType,
			quickCheck,
		})

		const isValid = !msg

		await validate(validateId, prop, {
			isValid,
			err: { msg },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validatePrivilegesAddress({
	validateId,
	setAddr = '',
	walletAddr = '',
	privLevel,
	authType,
	warningAccepted,
	dirty,
}) {
	return async function(dispatch, getState) {
		const isCurrentAddress =
			setAddr && setAddr.toLowerCase() === walletAddr.toLowerCase()
		let isValid = warningAccepted || !isCurrentAddress

		let msg = ''
		const args = [`PRIV_${privLevel}_LABEL`, authType.toUpperCase()]
		if (isCurrentAddress && privLevel === 0) {
			msg = 'ERR_PRIV_LVL_CURRENT_0'
		} else if (isCurrentAddress && privLevel === 1) {
			msg = 'ERR_PRIV_LVL_CURRENT_1'
		} else if (isCurrentAddress && privLevel >= 2) {
			isValid = true
		} else if (!isCurrentAddress) {
			isValid = true
		}

		await validate(validateId, 'setAddrWarning', {
			isValid,
			err: { msg, args },
			dirty,
		})(dispatch)

		return { isValid, msg }
	}
}

export function validatePrivLevel({ validateId, privLevel, dirty }) {
	return async function(dispatch, getState) {
		const isValid =
			Object.values(IdentityPrivilegeLevel).indexOf(privLevel) > -1
		await validate(validateId, 'privLevel', {
			isValid,
			err: { msg: 'ERR_PRIV_LEVEL_NOT_SELECTED' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateEmail(validateId, email, dirty, validateNotExisting) {
	return async function(dispatch) {
		const result = Joi.validate(email, account.email)
		let isValid = !result.error
		let msg = result.error ? result.error.message : ''

		if (validateNotExisting && isValid) {
			const { existing } = (await getEmail({ email })) || {}
			isValid = existing === false
			msg = 'EMAIL_ALREADY_USED'
		}

		await validate(validateId, 'email', {
			isValid,
			err: { msg },
			dirty,
		})(dispatch)

		return isValid
	}
}

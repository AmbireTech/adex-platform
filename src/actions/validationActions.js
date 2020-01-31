import * as types from 'constants/actionTypes'
import { updateSpinner } from './uiActions'
import { validEthAddress, freeAdExENS } from '../helpers/validators'
import { translate } from 'services/translations/translations'
import { addToast } from './uiActions'
import { getERC20Balance } from 'services/smart-contracts/actions/erc20'
import { formatUnits, bigNumberify, parseUnits } from 'ethers/utils'
import { validations, Joi, schemas } from 'adex-models'
import { validEmail, validPassword } from 'helpers/validators'
import { t } from 'selectors'
import { getErrorMsg } from 'helpers/errors'

const { campaignPut } = schemas
const { isNumberString } = validations

export function validateAddress({ addr, dirty, validate, name, setBalance }) {
	return async function(dispatch, getState) {
		const { wallet, identity } = getState().persist.account
		const { authType } = wallet
		try {
			if (validate) validate(name, { isValid: false })
			updateSpinner(name, dirty)(dispatch)
			const { msg } = await validEthAddress({
				addr,
				nonZeroAddr: true,
				nonERC20: !setBalance,
				authType,
			})
			const isValid = !msg

			if (typeof setBalance === 'function') {
				const balance =
					(await getERC20Balance({
						addr,
						authType,
						balanceFor: identity.address,
					})) || bigNumberify('0')
				setBalance(formatUnits(balance, 18))
			}
			if (validate)
				validate(name, { isValid: isValid, err: { msg: msg }, dirty: dirty })
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
	{ isValid, err = { msg: '', args: [] }, dirty = false, removeAll = false }
) {
	return async function(dispatch, getState) {
		if (!isValid) {
			let errors = {}
			errors[key] = {
				errMsg: t(err.msg, { args: err.args }),
				dirty: dirty,
			}

			updateValidationErrors(validateId, errors)(dispatch)
		} else if (removeAll) {
			resetValidationErrors(validateId)(dispatch)
		} else {
			resetValidationErrors(validateId, key)(dispatch)
		}
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

export function validateEmail(validateId, email, dirty) {
	return async function(dispatch, getState) {
		const isValid = validEmail(email)
		validate(validateId, 'email', {
			isValid,
			err: { msg: 'ERR_EMAIL' },
			dirty,
		})(dispatch)

		return isValid
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
			isValid: isValid,
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
			isValid: isValid,
			err: { msg: 'ERR_TOS_CHECK' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateENS({ ens, dirty, validate, name }) {
	return async function(dispatch, getState) {
		const { authType } = getState().persist.account.wallet
		try {
			if (validate) validate(name, { isValid: false })
			updateSpinner(name, dirty)(dispatch)
			const { msg } = await freeAdExENS({
				ens,
				authType,
			})
			const isValid = !msg
			updateSpinner(name, false)(dispatch)
			if (validate)
				validate(name, { isValid: isValid, err: { msg: msg }, dirty: dirty })
		} catch (error) {
			console.error('ERR_VALIDATING_ENS_ADDRESS', error)
			addToast({
				type: 'cancel',
				label: translate('ERR_VALIDATING_ENS_ADDRESS', { args: [error] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}
export function validateWallet(validateId, wallet, dirty) {
	return async function(dispatch, getState) {
		const isValid = !!wallet && !!wallet.address
		validate(validateId, 'wallet', {
			isValid: isValid,
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
			isValid: isValid,
			err: { msg: 'ERR_NO_IDENTITY_CONTRACT_OWNER' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateAccessWarning(validateId, accepted, dirty) {
	return async function(dispatch, getState) {
		const isValid = !!accepted
		validate(validateId, 'accessWarningCheck', {
			isValid: isValid,
			err: { msg: 'ERR_ACCESS_WARNING_CHECK' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateCampaignValidators({ validateId, validators, dirty }) {
	return async function(dispatch, getState) {
		const isValid =
			!!validators &&
			validators.length === 2 &&
			!!validators[0] &&
			!!validators[1] &&
			!!validators[0].id &&
			!!validators[0].url &&
			!!validators[0].fee &&
			!!validators[1].id &&
			!!validators[1].url &&
			!!validators[1].fee

		validate(validateId, 'validators', {
			isValid,
			err: { msg: 'ERR_VALIDATORS' },
			dirty,
		})(dispatch)

		return isValid
	}
}

const validateAmounts = ({
	maxDeposit = bigNumberify(0),
	depositAmount,
	minPerImpression,
}) => {
	let error = null
	if (!depositAmount.isZero() && depositAmount.gt(maxDeposit)) {
		error = {
			message: 'ERR_INSUFFICIENT_IDENTITY_BALANCE',
			prop: 'depositAmount',
		}
	}
	if (!depositAmount.isZero() && depositAmount.lt(minPerImpression)) {
		error = { message: 'ERR_CPM_OVER_DEPOSIT', prop: 'minPerImpression' }
	}
	if (depositAmount.lte(bigNumberify(0))) {
		error = { message: 'ERR_ZERO_DEPOSIT', prop: 'depositAmount' }
	}
	if (minPerImpression.lte(bigNumberify(0))) {
		error = { message: 'ERR_ZERO_CPM', prop: 'minPerImpression' }
	}

	return { error }
}

export function validateNumberString({ validateId, prop, value, dirty }) {
	return async function(dispatch, getState) {
		const isValid = isNumberString(value)

		validate(validateId, prop, {
			isValid,
			err: { msg: 'ERR_INVALID_AMOUNT' },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateCampaignAmount({
	validateId,
	prop,
	value,
	dirty,
	errMsg,
	depositAmount,
	minPerImpression,
	maxDeposit,
	decimals,
}) {
	return async function(dispatch, getState) {
		const isValidNumber = isNumberString(value)
		let isValid = isValidNumber && parseUnits(value, decimals)
		let msg = errMsg || 'ERR_INVALID_AMOUNT'

		if (isValid) {
			const deposit = prop === 'depositAmount' ? value : depositAmount
			const min = prop === 'minPerImpression' ? value : minPerImpression

			const isValidDeposit = isNumberString(deposit)
			const isValidMin = isNumberString(min)

			if (isValidDeposit && isValidMin) {
				const result = validateAmounts({
					maxDeposit,
					depositAmount: parseUnits(deposit, decimals),
					minPerImpression: parseUnits(min, decimals),
				})

				isValid = !result.error
				msg = result.error ? result.error.message : ''
			}
		}

		validate(validateId, prop, {
			isValid,
			err: { msg },
			dirty,
		})(dispatch)

		return isValid
	}
}

const MIN_CAMPAIGN_PERIOD = 1 * 60 * 60 * 1000 // 1 hour

const getCampaignDatesValidation = ({
	created = Date.now(),
	withdrawPeriodStart,
	activeFrom,
}) => {
	let error = null

	if (withdrawPeriodStart && activeFrom && withdrawPeriodStart <= activeFrom) {
		error = { message: 'ERR_END_BEFORE_START', prop: 'withdrawPeriodStart' }
	} else if (
		withdrawPeriodStart &&
		activeFrom &&
		withdrawPeriodStart - activeFrom < MIN_CAMPAIGN_PERIOD
	) {
		error = {
			message: 'ERR_MIN_CAMPAIGN_PERIOD',
			args: ['1', 'HOUR'],
			prop: 'withdrawPeriodStart',
		}
	} else if (withdrawPeriodStart && withdrawPeriodStart < created) {
		error = { message: 'ERR_END_BEFORE_NOW', prop: 'withdrawPeriodStart' }
	} else if (activeFrom && activeFrom < created) {
		error = { message: 'ERR_START_BEFORE_NOW' }
	} else if (activeFrom && !withdrawPeriodStart) {
		error = { message: 'ERR_NO_END', prop: 'withdrawPeriodStart' }
	} else if (!(withdrawPeriodStart || activeFrom)) {
		error = { message: 'ERR_NO_DATE_SET', prop: 'withdrawPeriodStart' }
	}

	return { error }
}

export function validateCampaignDates({
	validateId,
	prop,
	value,
	dirty,
	withdrawPeriodStart,
	activeFrom,
	created,
}) {
	return async function(dispatch, getState) {
		const withdraw =
			prop === 'withdrawPeriodStart' ? value : withdrawPeriodStart
		const from = prop === 'activeFrom' ? value : activeFrom

		const result = getCampaignDatesValidation({
			withdrawPeriodStart: withdraw,
			activeFrom: from,
			created,
		})

		validate(validateId, 'activeFrom', {
			isValid: !!from,
			err: {
				msg: 'ERR_NO_DATE_SET',
			},
			dirty: dirty,
		})(dispatch)

		validate(validateId, 'withdrawPeriodStart', {
			isValid: !(result.error && result.error.prop === 'withdrawPeriodStart'),
			err: {
				msg: result.error ? result.error.message : '',
				args: result.error.args ? result.error.args : [],
			},
			dirty: dirty,
		})(dispatch)

		const isValid = !result.error

		return isValid
	}
}

export function validateCampaignTitle({ validateId, title, dirty }) {
	return async function(dispatch, getState) {
		const result = Joi.validate(title, campaignPut.title)

		const isValid = !result.error

		validate(validateId, 'title', {
			isValid,
			err: { msg: result.error ? result.error.message : '' },
			dirty: dirty,
		})(dispatch)

		return isValid
	}
}

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
import {
	MAX_CAMPAIGN_WITHDRAW_START_DAYS,
	MAX_CAMPAIGN_WITHDRAW_START,
} from 'constants/targeting'
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

export function validateUserSide(validateId, userSide, dirty) {
	return async function(dispatch, getState) {
		const isValid = !!userSide
		validate(validateId, 'userSide', {
			isValid,
			err: { msg: 'ERR_USER_SIDE_SELECT_CHECK' },
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

export function validateCampaignUnits({ validateId, adUnits, dirty }) {
	return async function(dispatch, getState) {
		const isValid = !!adUnits && adUnits.length
		validate(validateId, 'adUnits', {
			isValid,
			err: { msg: 'ERR_ADUNITS_REQUIRED' },
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
			validators[0].feeNum !== undefined &&
			validators[0].feeDen !== undefined &&
			validators[0].feeAddr !== undefined &&
			!!validators[1].id &&
			!!validators[1].url &&
			validators[1].feeNum !== undefined &&
			validators[1].feeDen !== undefined &&
			validators[0].feeAddr !== undefined

		validate(validateId, 'validators', {
			isValid,
			err: { msg: 'ERR_VALIDATORS' },
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

export function validateCampaignAmount({
	validateId,
	dirty,
	errMsg,
	depositAmount,
	pricingBounds = { IMPRESSION: {} },
	specPricingBounds,
	maxDeposit,
	decimals,
}) {
	return async function(dispatch, getState) {
		const min = pricingBounds.IMPRESSION.min || ''
		const max = pricingBounds.IMPRESSION.max || ''
		const isValidNumberDeposit = isNumberString(depositAmount)
		const isValidNumberMin = isNumberString(min)
		const isValidNumberMax = isNumberString(max)

		const checkSpeckBounds = !!specPricingBounds && specPricingBounds.IMPRESSION

		let isValidDeposit = isValidNumberDeposit
		let isValidMin = isValidNumberMin
		let isValidMax = isValidNumberMax

		let msgDeposit = errMsg || 'ERR_INVALID_AMOUNT'
		let msgMin = errMsg || 'ERR_INVALID_AMOUNT'
		let msgMax = errMsg || 'ERR_INVALID_AMOUNT'
		let argsMin = []
		let argsMax = []
		let argsDeposit = []

		if (isValidDeposit && isValidMin && isValidMax) {
			const depositBn = utils.parseUnits(depositAmount, decimals)
			const minBn = utils.parseUnits(min, decimals)
			const maxBn = utils.parseUnits(max, decimals)

			if (!depositBn.isZero() && depositBn.gt(maxDeposit)) {
				isValidDeposit = false
				msgDeposit = 'ERR_INSUFFICIENT_IDENTITY_BALANCE'
			}

			if (!depositBn.isZero() && depositBn.lt(minBn)) {
				isValidDeposit = false
				msgDeposit = 'ERR_DEPOSIT_UNDER_CPM'

				isValidMin = false
				msgMin = 'ERR_CPM_OVER_DEPOSIT'
			}

			if (!depositBn.isZero() && depositBn.lt(maxBn)) {
				isValidDeposit = false
				msgDeposit = 'ERR_DEPOSIT_UNDER_MAX_CPM'

				isValidMax = false
				msgMax = 'ERR_MAX_CPM_OVER_DEPOSIT'
			}

			if (depositBn.lte(BigNumber.from(0))) {
				isValidDeposit = false
				msgDeposit = 'ERR_ZERO_DEPOSIT'
			}

			if (minBn.lte(BigNumber.from(0))) {
				isValidMin = false
				msgMin = 'ERR_ZERO_MIN_CPM'
			}

			if (maxBn.lte(BigNumber.from(0))) {
				isValidMax = false
				msgMax = 'ERR_ZERO_MAX_CPM'
			}

			if (maxBn.lt(minBn)) {
				isValidMax = false
				msgMax = 'ERR_MAX_CPM_LT_MIN_CPM'

				isValidMin = false
				msgMin = 'ERR_MIN_CPM_GT_MAX_CPM'
			}

			if (
				checkSpeckBounds &&
				minBn.div(1000).lt(BigNumber.from(specPricingBounds.IMPRESSION.min))
			) {
				isValidMin = false
				msgMin = 'ERR_MIN_CPM_LESS_THAN_SPEC'
				argsMin = [
					bondPerActionToUserInputPerMileValue(
						specPricingBounds.IMPRESSION.min,
						decimals
					),
				]
			}

			if (
				checkSpeckBounds &&
				maxBn.div(1000).gt(BigNumber.from(specPricingBounds.IMPRESSION.max))
			) {
				isValidMax = false
				msgMax = 'ERR_MAX_CPM_HIGHER_THAN_SPEC'
				argsMax = [
					bondPerActionToUserInputPerMileValue(
						specPricingBounds.IMPRESSION.max,
						decimals
					),
				]
			}
		}

		await validate(validateId, 'depositAmount', {
			isValid: isValidDeposit,
			err: { msg: msgDeposit, args: argsDeposit },
			dirty,
		})(dispatch)

		await validate(validateId, 'minPerImpression', {
			isValid: isValidMin,
			err: { msg: msgMin, args: argsMin },
			dirty,
		})(dispatch)

		await validate(validateId, 'maxPerImpression', {
			isValid: isValidMax,
			err: { msg: msgMax, args: argsMax },
			dirty,
		})(dispatch)

		return isValidDeposit && isValidMin && isValidMax
	}
}

const MIN_CAMPAIGN_PERIOD = 1 * 60 * 60 * 1000 // 1 hour

const getCampaignDatesValidation = ({
	created = Date.now(),
	withdrawPeriodStart,
	activeFrom,
}) => {
	let errActiveFrom = null
	let errWithdrawPeriodStart = null

	if (withdrawPeriodStart && activeFrom && withdrawPeriodStart <= activeFrom) {
		errWithdrawPeriodStart = { message: 'ERR_END_BEFORE_START' }
	} else if (
		withdrawPeriodStart &&
		activeFrom &&
		withdrawPeriodStart - activeFrom < MIN_CAMPAIGN_PERIOD
	) {
		errWithdrawPeriodStart = {
			message: 'ERR_MIN_CAMPAIGN_PERIOD',
			args: ['1', 'HOUR'],
		}
	} else if (withdrawPeriodStart && withdrawPeriodStart < created) {
		errWithdrawPeriodStart = { message: 'ERR_END_BEFORE_NOW' }
	} else if (activeFrom && activeFrom < created) {
		errActiveFrom = { message: 'ERR_START_BEFORE_NOW' }
	} else if (activeFrom && !withdrawPeriodStart) {
		errWithdrawPeriodStart = { message: 'ERR_NO_END' }
	}

	if (!withdrawPeriodStart) {
		errWithdrawPeriodStart = { message: 'ERR_NO_DATE_SET' }
	}

	if (withdrawPeriodStart > created + MAX_CAMPAIGN_WITHDRAW_START) {
		errWithdrawPeriodStart = {
			message: 'ERR_CAMPAIGN_END_DATE_OVER_MAX',
			args: [MAX_CAMPAIGN_WITHDRAW_START_DAYS],
		}
	}

	if (!activeFrom) {
		errActiveFrom = { message: 'ERR_NO_DATE_SET' }
	}

	return { errActiveFrom, errWithdrawPeriodStart }
}

export function validateCampaignDates({
	validateId,
	activeFrom,
	withdrawPeriodStart,
	dirty,
	created,
}) {
	return async function(dispatch, getState) {
		const {
			errActiveFrom,
			errWithdrawPeriodStart,
		} = getCampaignDatesValidation({
			withdrawPeriodStart,
			activeFrom,
			created,
		})

		validate(validateId, 'activeFrom', {
			isValid: !errActiveFrom,
			err: {
				msg: (errActiveFrom || {}).message,
			},
			dirty: dirty,
		})(dispatch)

		validate(validateId, 'withdrawPeriodStart', {
			isValid: !errWithdrawPeriodStart,
			err: {
				msg: errWithdrawPeriodStart ? errWithdrawPeriodStart.message : '',
				args: errWithdrawPeriodStart && (errWithdrawPeriodStart.args || []),
			},
			dirty: dirty,
		})(dispatch)

		const isValid = !errWithdrawPeriodStart && !errActiveFrom

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

export function validateSchemaProp({ validateId, value, prop, schema, dirty }) {
	return async function(dispatch) {
		const result = Joi.validate(value, schema)
		const isValid = !result.error

		await validate(validateId, prop, {
			isValid,
			err: { msg: result.error ? result.error.message : '' },
			dirty: dirty,
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

export const locationAudienceInputError = ({ apply, ...values } = {}) => {
	if (!apply) {
		return 'ERR_LOCATION_AUDIENCE_NOT_SELECTED'
	} else if (apply === 'in' && !values.in.length) {
		return 'ERR_LOCATION_AUDIENCE_IN_NOT_SELECTED'
	} else if (apply === 'nin' && !values.nin.length) {
		return 'ERR_LOCATION_AUDIENCE_NIN_NOT_SELECTED'
	} else if (
		apply === 'nin' &&
		Object.keys(CountryTiers).every(x => values.nin.includes(x))
	) {
		return 'ERR_LOCATION_CAN_NOT_EXCLUDE_ALL_COUNTRIES'
	}
}

export const publishersAudienceInputError = ({ apply, ...values } = {}) => {
	if (!apply) {
		return 'ERR_PUBLISHERS_AUDIENCE_NOT_SELECTED'
	} else if (apply === 'in' && (!values.in || !values.in.length)) {
		return 'ERR_PUBLISHERS_AUDIENCE_IN_NOT_SELECTED'
	} else if (apply === 'nin' && (!values.nin || !values.nin.length)) {
		return 'ERR_PUBLISHERS_AUDIENCE_NIN_NOT_SELECTED'
	}
}

export const categoriesAudienceInputError = ({
	apply = [],
	...values
} = {}) => {
	if (!apply.includes('in')) {
		return 'ERR_CATEGORIES_AUDIENCE_NOT_SELECTED'
	} else if (apply.includes('in') && (!values.in || !values.in.length)) {
		return 'ERR_CATEGORIES_AUDIENCE_IN_NOT_SELECTED'
	}
}

export const devicesAudienceInputError = ({ apply, ...values } = {}) => {
	if (
		apply === 'nin' &&
		Object.keys(OsGroups).every(x => values.nin.includes(x))
	) {
		return 'ERR_DEVICES_CAN_NOT_EXCLUDE_ALL_DEVICES'
	}
}

export function validateAudience({ validateId, propName, inputs, dirty }) {
	return async function(dispatch) {
		const { location, categories, publishers, devices } = inputs

		const errors = [
			locationAudienceInputError(location),
			publishersAudienceInputError(publishers),
			categoriesAudienceInputError(categories),
			devicesAudienceInputError(devices),
		]

		const isValid = errors.every(e => !e)
		const errArgs = errors
			.filter(e => !!e)
			.map(e => t(e))
			.join(', ')

		await validate(validateId, propName, {
			isValid,
			err: {
				msg: 'ERR_AUDIENCE_INPUT',
				args: [errArgs],
				fields: {
					location: !!errors[0],
					publishers: !!errors[1],
					categories: !!errors[2],
					devices: !!errors[3],
				},
			},
			dirty: dirty,
		})(dispatch)

		return isValid
	}
}

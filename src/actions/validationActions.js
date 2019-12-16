import * as types from 'constants/actionTypes'
import { updateSpinner } from './uiActions'
import { validEthAddress } from '../helpers/validators'
import { translate } from 'services/translations/translations'
import { addToast } from './uiActions'
import { getERC20Balance } from 'services/smart-contracts/actions/erc20'
import { formatUnits, bigNumberify } from 'ethers/utils'
import {
	validEmail,
	validPassword,
	validQuickAccountCoupon,
} from 'helpers/validators'
import { t } from 'selectors'
import { getErrorMsg } from 'helpers/errors'
import { checkCoupon } from 'services/adex-relayer/actions'

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

export function validateGrantCode(validateId, hasGrantCode, coupon, dirty) {
	return async function(dispatch, getState) {
		updateSpinner(validateId + 'grant-check', true)(dispatch)
		let isValid = true
		let msg = ''
		try {
			if (hasGrantCode) {
				isValid = validQuickAccountCoupon(coupon)

				if (isValid) {
					const cpn = await checkCoupon({ coupon })
					isValid = cpn.exist === true && cpn.used === false
					if (cpn.exist === false) {
						msg = 'ERR_COUPON_NOT_EXIST'
					} else if (cpn.used === true) {
						msg = 'ERR_COUPON_USED'
					}
				} else {
					msg = 'ERR_COUPON_FORMAT'
				}
			}
		} catch (err) {
			isValid = false
			msg = err
			console.error('ERR_CHECKING_GRANT_CODE', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_CHECKING_GRANT_CODE', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		validate(validateId, 'grantCode', {
			isValid,
			err: { msg },
			dirty,
		})(dispatch)
		updateSpinner(validateId + 'grant-check', false)(dispatch)
	}
}

import React, { Component } from 'react'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Translate from 'components/translate/Translate'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import {
	validEmail,
	validPassword,
	validQuickAccountCoupon,
} from 'helpers/validators'
import { checkCoupon } from 'services/adex-relayer/actions'

class GrantInfo extends Component {
	componentDidMount() {
		const {
			email,
			emailCheck,
			password,
			passwordCheck,
			coupon,
			tosCheck,
		} = this.props.identity

		this.validateEmail(email, false)
		this.validateEmailCheck(emailCheck, false)
		this.validatePassword(password, false)
		this.validatePasswordCheck(passwordCheck, false)
		this.validateCoupon(coupon, false)
		this.validateTOS(tosCheck, false)
	}

	validateEmail(email, dirty) {
		const isValid = validEmail(email)
		this.props.validate('email', {
			isValid: isValid,
			err: { msg: 'ERR_EMAIL' },
			dirty: dirty,
		})
	}

	validateEmailCheck(emailCheck, email, dirty) {
		const isValid = !!emailCheck && !!email && emailCheck === email
		this.props.validate('emailCheck', {
			isValid: isValid,
			err: { msg: 'ERR_EMAIL_CHECK' },
			dirty: dirty,
		})
	}

	validatePassword(password, dirty) {
		const isValid = validPassword(password)
		this.props.validate('password', {
			isValid: isValid,
			err: { msg: 'ERR_PASSWORD' },
			dirty: dirty,
		})
	}

	validatePasswordCheck(passwordCheck, password, dirty) {
		const isValid = !!passwordCheck && !!password && passwordCheck === password
		this.props.validate('passwordCheck', {
			isValid: isValid,
			err: { msg: 'ERR_PASSWORD_CHECK' },
			dirty: dirty,
		})
	}

	validateCoupon(coupon, dirty) {
		const isValidFormat = validQuickAccountCoupon(coupon)

		if (!isValidFormat) {
			this.props.validate('coupon', {
				isValid: isValidFormat,
				err: { msg: 'ERR_COUPON_FORMAT' },
				dirty: dirty,
			})
		} else {
			this.setState({ waitingCheck: true }, () => {
				checkCoupon({ coupon })
					.then((cpn = {}) => {
						const isValid = cpn.exist === true && cpn.used === false
						let msg = ''
						if (cpn.exist === false) {
							msg = 'ERR_COUPON_NOT_EXIST'
						} else if (cpn.used === true) {
							msg = 'ERR_COUPON_USED'
						}

						this.props.validate('coupon', {
							isValid: isValid,
							err: { msg: msg },
							dirty: dirty,
						})
					})
					.catch(err => {
						this.props.validate('coupon', {
							isValid: false,
							err: { msg: 'ERR_COUPON_NETWORK' },
							dirty: true,
						})
					})
			})
		}
	}

	validateTOS(accepted, dirty) {
		this.props.validate('tosCheck', {
			isValid: !!accepted,
			err: { msg: 'ERR_TOS_CHECK' },
			dirty: dirty,
		})
	}

	tosCheck(checked) {
		this.props.handleChange('tosCheck', checked)
		this.validateTOS(checked, true)
	}

	render() {
		const { t, identity, handleChange, invalidFields } = this.props
		// Errors
		const {
			coupon,
			email,
			emailCheck,
			password,
			passwordCheck,
			tosCheck,
		} = invalidFields
		return (
			<div>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('coupon', { isProp: true })}
							name='coupon'
							value={identity.coupon || ''}
							onChange={ev => handleChange('coupon', ev.target.value)}
							onBlur={() => this.validateCoupon(identity.coupon, true)}
							onFocus={() => this.validateCoupon(identity.coupon, false)}
							error={coupon && !!coupon.dirty}
							maxLength={128}
							helperText={
								coupon && !!coupon.dirty
									? coupon.errMsg
									: t('ENTER_VALID_COUPON')
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('email', { isProp: true })}
							name='email'
							value={identity.email || ''}
							onChange={ev => handleChange('email', ev.target.value.trim())}
							onBlur={() => this.validateEmail(identity.email, true)}
							onFocus={() => this.validateEmail(identity.email, false)}
							error={email && !!email.dirty}
							maxLength={128}
							helperText={
								email && !!email.dirty ? email.errMsg : t('ENTER_VALID_EMAIL')
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('emailCheck', { isProp: true })}
							name='emailCheck'
							value={identity.emailCheck || ''}
							onChange={ev =>
								handleChange('emailCheck', ev.target.value.trim())
							}
							onBlur={() =>
								this.validateEmailCheck(
									identity.emailCheck,
									identity.email,
									true
								)
							}
							onFocus={() =>
								this.validateEmailCheck(
									identity.emailCheck,
									identity.email,
									false
								)
							}
							error={emailCheck && !!emailCheck.dirty}
							maxLength={128}
							helperText={
								emailCheck && !!emailCheck.dirty
									? emailCheck.errMsg
									: t('ENTER_SAME_EMAIL')
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							type='password'
							required
							label={t('password', { isProp: true })}
							name='password'
							value={identity.password || ''}
							onChange={ev => handleChange('password', ev.target.value)}
							onBlur={() => this.validatePassword(identity.password, true)}
							onFocus={() => this.validatePassword(identity.password, false)}
							error={password && !!password.dirty}
							maxLength={128}
							helperText={
								password && !!password.dirty
									? password.errMsg
									: t('PASSWORD_RULES')
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							type='password'
							required
							label={t('passwordCheck', { isProp: true })}
							name='passwordCheck'
							value={identity.passwordCheck || ''}
							onChange={ev => handleChange('passwordCheck', ev.target.value)}
							onBlur={() =>
								this.validatePasswordCheck(
									identity.passwordCheck,
									identity.password,
									true
								)
							}
							onFocus={() =>
								this.validatePasswordCheck(
									identity.passwordCheck,
									identity.password,
									false
								)
							}
							error={passwordCheck && !!passwordCheck.dirty}
							maxLength={128}
							helperText={
								passwordCheck && !!passwordCheck.dirty
									? passwordCheck.errMsg
									: t('PASSWORD_CHECK_RULES')
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<FormControl
							required
							error={tosCheck && tosCheck.dirty}
							component='fieldset'
							// className={classes.formControl}
						>
							<FormControlLabel
								control={
									<Checkbox
										checked={!!identity.tosCheck}
										onChange={ev => this.tosCheck(ev.target.checked)}
										value='tosCheck'
										color='primary'
									/>
								}
								label={t('TOS_CHECK')}
							/>
							{tosCheck && !!tosCheck.dirty && (
								<FormHelperText>{tosCheck.errMsg}</FormHelperText>
							)}
						</FormControl>
					</Grid>
				</Grid>
			</div>
		)
	}
}

const IdentityGrantInfoStep = IdentityHoc(GrantInfo)
export default Translate(withStyles(styles)(IdentityGrantInfoStep))

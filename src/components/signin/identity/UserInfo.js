import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
// import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { validEmail, validPassword } from 'helpers/validators'

class UserInfo extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
			mnemonic: props.wallet.mnemonic,
		}
	}

	componentDidMount() {
		this.props.validate('email', {
			isValid: !!this.props.identity.email,
			err: { msg: 'ERR_NO_EMAIL' },
			dirty: false,
		})
		this.props.validate('emailCheck', {
			isValid: !!this.props.identity.emailCheck,
			err: { msg: 'ERR_NO_EMAIL_CHECK' },
			dirty: false,
		})
		this.props.validate('password', {
			isValid: !!this.props.identity.password,
			err: { msg: 'ERR_NO_PASSWORD' },
			dirty: false,
		})
		this.props.validate('passwordCheck', {
			isValid: !!this.props.identity.passwordCheck,
			err: { msg: 'ERR_NO_PASSWORD_CHECK' },
			dirty: false,
		})
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
			err: { msg: 'ERR_EMAIL_CHECK' },
			dirty: dirty,
		})
	}

	render() {
		const { t, identity, handleChange, invalidFields } = this.props
		// Errors
		const { email, emailCheck, password, passwordCheck } = invalidFields
		return (
			<div>
				<Grid container spacing={2}>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('email', { isProp: true })}
							name='email'
							value={identity.email}
							onChange={ev => handleChange('email', ev.target.value)}
							onBlur={() => this.validateEmail(identity.email, true)}
							onFocus={() => this.validateEmail(identity.email, false)}
							error={email && !!email.dirty}
							maxLength={128}
							helperText={
								email && !!email.dirty ? email.errMsg : t('ENTER_VALID_EMAIL')
							}
						/>
					</Grid>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('emailCheck', { isProp: true })}
							name='emailCheck'
							value={identity.emailCheck}
							onChange={ev => handleChange('emailCheck', ev.target.value)}
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
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='password'
							required
							label={t('password', { isProp: true })}
							name='password'
							value={identity.password}
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
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='password'
							required
							label={t('passwordCheck', { isProp: true })}
							name='passwordCheck'
							value={identity.passwordCheck}
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
				</Grid>
			</div>
		)
	}
}

UserInfo.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
	let persist = state.persist
	let memory = state.memory
	return {
		account: persist.account,
		wallet: memory.wallet,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

const IdentityUserInfoStep = IdentityHoc(UserInfo)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(IdentityUserInfoStep)))

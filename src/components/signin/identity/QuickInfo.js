import React from 'react'
import IdentityHoc from './IdentityHoc'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import {
	t,
	// selectIdentity,
	selectValidationsById,
} from 'selectors'
import {
	execute,
	validateEmail,
	validateEmailCheck,
	validatePassword,
	validatePasswordCheck,
	validateTOS,
} from 'actions'

const GrantInfo = props => {
	const checkTos = checked => {
		handleChange('tosCheck', checked)
		execute(validateTOS(validateId, checked, true))
	}

	const { validateId, identity, handleChange } = props
	// const identity = useSelector(selectIdentity)
	const validations = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	// Errors
	const { email, emailCheck, password, passwordCheck, tosCheck } = validations
	return (
		<div>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<TextField
						fullWidth
						type='text'
						required
						label={t('email', { isProp: true })}
						name='email'
						value={identity.email || ''}
						onChange={ev => handleChange('email', ev.target.value)}
						onBlur={() =>
							execute(validateEmail(validateId, identity.email, true))
						}
						onFocus={() =>
							execute(validateEmail(validateId, identity.email, false))
						}
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
						onChange={ev => handleChange('emailCheck', ev.target.value)}
						onBlur={() =>
							execute(
								validateEmailCheck(
									validateId,
									identity.emailCheck,
									identity.email,
									true
								)
							)
						}
						onFocus={() =>
							validateEmailCheck(
								validateId,
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
						onBlur={() =>
							execute(validatePassword(validateId, identity.password, true))
						}
						onFocus={() =>
							execute(validatePassword(validateId, identity.password, false))
						}
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
							execute(
								validatePasswordCheck(
									validateId,
									identity.passwordCheck,
									identity.password,
									true
								)
							)
						}
						onFocus={() =>
							execute(
								validatePasswordCheck(
									validateId,
									identity.passwordCheck,
									identity.password,
									false
								)
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
									onChange={ev => checkTos(ev.target.checked)}
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

const IdentityGrantInfoStep = IdentityHoc(GrantInfo)
export default withStyles(styles)(IdentityGrantInfoStep)

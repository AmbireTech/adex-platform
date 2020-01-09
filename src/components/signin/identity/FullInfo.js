import React from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Collapse from '@material-ui/core/Collapse'
import Switch from '@material-ui/core/Switch'
import { t, selectIdentity, selectValidationsById } from 'selectors'
import {
	execute,
	validateEmail,
	validateEmailCheck,
	validateTOS,
	updateIdentity,
} from 'actions'

// TODO: work in progress - need to add validations, and generating identity for the address
const FulInfo = props => {
	const checkTos = checked => {
		execute(updateIdentity('tosCheck', checked))
		execute(validateTOS(validateId, checked, true))
	}

	const { validateId } = props
	const identity = useSelector(selectIdentity)
	const validations = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	// Errors
	const { email, emailCheck, tosCheck } = validations
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
						onChange={ev => execute(updateIdentity('email', ev.target.value))}
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
						onChange={ev =>
							execute(updateIdentity('emailCheck', ev.target.value))
						}
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
							execute(
								validateEmailCheck(
									validateId,
									identity.emailCheck,
									identity.email,
									false
								)
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
					<FormControl
						required
						error={tosCheck && tosCheck.dirty}
						component='fieldset'
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

export default FulInfo

import React from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Anchor from 'components/common/anchor/anchor'
import {
	ContentBox,
	ContentBody,
	FullContentMessage,
} from 'components/common/dialog/content'
import {
	t,
	selectIdentity,
	selectValidationsById,
	selectSpinnerById,
} from 'selectors'
import {
	execute,
	validateEmail,
	validateEmailCheck,
	validatePassword,
	validatePasswordCheck,
	updateIdentity,
} from 'actions'

import { CREATING_SESSION } from 'constants/spinners'

const QuickInfo = props => {
	const { validateId } = props
	const identity = useSelector(selectIdentity)

	const validations = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)
	const spinner = useSelector(state => selectSpinnerById(state, validateId))
	const sessionSpinner = useSelector(state =>
		selectSpinnerById(state, CREATING_SESSION)
	)
	const walletMsgs = [
		{ message: 'PROCESSING_LOCAL_WALLET' },
		sessionSpinner ? { message: 'CREATING_SESSION_LOCAL_WALLET' } : {},
	]

	// Errors
	const {
		email,
		emailCheck,
		password,
		passwordCheck,
		tosCheck,
		accessWarningCheck,
	} = validations
	return (
		<ContentBox>
			{spinner || sessionSpinner ? (
				<FullContentMessage
					msgs={walletMsgs}
					spinner={true}
				></FullContentMessage>
			) : (
				<ContentBody>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<TextField
								fullWidth
								type='text'
								required
								label={t('email', { isProp: true })}
								name='email'
								value={identity.email || ''}
								onChange={ev =>
									execute(updateIdentity('email', ev.target.value))
								}
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
							<TextField
								fullWidth
								type='password'
								required
								label={t('password', { isProp: true })}
								name='password'
								value={identity.password || ''}
								onChange={ev =>
									execute(updateIdentity('password', ev.target.value))
								}
								onBlur={() =>
									execute(validatePassword(validateId, identity.password, true))
								}
								onFocus={() =>
									execute(
										validatePassword(validateId, identity.password, false)
									)
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
								onChange={ev =>
									execute(updateIdentity('passwordCheck', ev.target.value))
								}
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
								error={accessWarningCheck && accessWarningCheck.dirty}
								component='fieldset'
							>
								<FormControlLabel
									control={
										<Checkbox
											checked={!!identity.accessWarningCheck}
											onChange={ev =>
												execute(
													updateIdentity(
														'accessWarningCheck',
														ev.target.checked
													)
												)
											}
											value='accessWarningCheck'
											color='primary'
										/>
									}
									label={t('ACCESS_WARNING_QUICK_CHECK')}
								/>
								{accessWarningCheck && !!accessWarningCheck.dirty && (
									<FormHelperText>{accessWarningCheck.errMsg}</FormHelperText>
								)}
							</FormControl>
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
											onChange={ev =>
												execute(updateIdentity('tosCheck', ev.target.checked))
											}
											value='tosCheck'
											color='primary'
										/>
									}
									label={
										<Anchor
											target='_blank'
											href={`${process.env.ADEX_TOS_URL}`}
										>
											{t('TOS_CHECK')}
										</Anchor>
									}
								/>
								{tosCheck && !!tosCheck.dirty && (
									<FormHelperText>{tosCheck.errMsg}</FormHelperText>
								)}
							</FormControl>
						</Grid>
					</Grid>
				</ContentBody>
			)}
		</ContentBox>
	)
}

export default QuickInfo

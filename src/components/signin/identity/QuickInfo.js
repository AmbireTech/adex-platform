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
import Dropdown from 'components/common/dropdown'
import {
	t,
	selectIdentity,
	selectValidationsById,
	selectSpinnerById,
	selectKnowUsFromSource,
	selectUserSides,
} from 'selectors'
import { execute, updateIdentity } from 'actions'

import { CREATING_SESSION } from 'constants/spinners'

const knowFromSource = selectKnowUsFromSource()
const userSides = selectUserSides()

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
		knowFrom,
		moreInfo,
		userSide,
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
								variant='outlined'
								required
								label={t('email', { isProp: true })}
								name='email'
								value={identity.email || ''}
								onChange={ev =>
									execute(updateIdentity('email', ev.target.value))
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
								variant='outlined'
								required
								label={t('emailCheck', { isProp: true })}
								name='emailCheck'
								value={identity.emailCheck || ''}
								onChange={ev =>
									execute(updateIdentity('emailCheck', ev.target.value))
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
								variant='outlined'
								type='password'
								required
								label={t('password', { isProp: true })}
								name='password'
								value={identity.password || ''}
								onChange={ev =>
									execute(updateIdentity('password', ev.target.value))
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
								variant='outlined'
								type='password'
								required
								label={t('passwordCheck', { isProp: true })}
								name='passwordCheck'
								value={identity.passwordCheck || ''}
								onChange={ev =>
									execute(updateIdentity('passwordCheck', ev.target.value))
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
							<Dropdown
								required
								fullWidth
								variant='outlined'
								name='knowFrom'
								label={t('knowFrom', { isProp: true })}
								onChange={val => execute(updateIdentity('knowFrom', val))}
								source={knowFromSource}
								value={identity.knowFrom || ''}
								htmlId='select-know-from'
								error={knowFrom && !!knowFrom.dirty}
								helperText={
									knowFrom && !!knowFrom.dirty
										? knowFrom.errMsg
										: t('KNOW_FROM_CHECK_RULES')
								}
							/>
						</Grid>
						{(identity.knowFrom === 'event' ||
							identity.knowFrom === 'other') && (
							<Grid item xs={12}>
								<TextField
									fullWidth
									variant='outlined'
									required
									label={t('moreInfo', { isProp: true })}
									name='moreInfo'
									value={identity.moreInfo || ''}
									onChange={ev =>
										execute(updateIdentity('moreInfo', ev.target.value))
									}
									error={moreInfo && !!moreInfo.dirty}
									maxLength={128}
									helperText={
										moreInfo && !!moreInfo.dirty
											? moreInfo.errMsg
											: t('MORE_INFO_CHECK_RULES')
									}
								/>
							</Grid>
						)}
						<Grid item xs={12}>
							<Dropdown
								required
								fullWidth
								variant='outlined'
								name='userSide'
								label={t('userSide', { isProp: true })}
								onChange={val => execute(updateIdentity('userSide', val))}
								source={userSides}
								value={identity.userSide || ''}
								htmlId='select-user-side'
								error={userSide && !!userSide.dirty}
								helperText={
									userSide && !!userSide.dirty
										? userSide.errMsg
										: t('USER_SIDE')
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

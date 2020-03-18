import React from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import {
	t,
	selectIdentity,
	selectValidationsById,
	selectSpinnerById,
} from 'selectors'
import Anchor from 'components/common/anchor/anchor'
import { execute, updateIdentity } from 'actions'
import {
	ContentBox,
	ContentBody,
	FullContentMessage,
} from 'components/common/dialog/content'
import Dropdown from 'components/common/dropdown'
import { CREATING_SESSION } from 'constants/spinners'
import { WALLET_ACTIONS_MSGS } from 'constants/misc'
import { WHERE_YOU_KNOW_US } from 'constants/misc'

const knowFromSource = WHERE_YOU_KNOW_US.map(knowFrom => {
	const translated = { ...knowFrom }
	translated.label = t(knowFrom.label)
	return translated
})

const FulInfo = props => {
	const { validateId } = props
	const identity = useSelector(selectIdentity)
	const { wallet = {} } = identity
	const validations = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	const sessionSpinner = useSelector(state =>
		selectSpinnerById(state, CREATING_SESSION)
	)

	const walletAddress = (identity.wallet || {}).address || identity.walletAddr

	const walletMsgs = WALLET_ACTIONS_MSGS[wallet.authType || 'default']
	// Errors
	const {
		email,
		emailCheck,
		tosCheck,
		accessWarningCheck,
		knowFrom,
		moreInfo,
	} = validations
	return (
		<ContentBox>
			{sessionSpinner ? (
				<FullContentMessage
					msgs={walletMsgs}
					spinner={true}
				></FullContentMessage>
			) : (
				<ContentBody>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							{walletAddress}
						</Grid>
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
							<Dropdown
								required
								fullWidth
								name='knowFrom'
								label={t('knowFrom', { isProp: true })}
								onChange={val => execute(updateIdentity('knowFrom', val))}
								source={knowFromSource}
								value={identity.knowFrom || ''}
								htmlId='timeframe-select'
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
									label={t('ACCESS_WARNING_FULL_CHECK', {
										args: [wallet.authType],
									})}
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

export default FulInfo

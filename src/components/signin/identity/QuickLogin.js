import React from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import {
	ContentBox,
	ContentBody,
	FullContentMessage,
} from 'components/common/dialog/content'
import { execute, updateIdentity } from 'actions'
import {
	t,
	selectIdentity,
	selectValidationsById,
	selectSpinnerById,
} from 'selectors'
import { CREATING_SESSION } from 'constants/spinners'

const QuickLogin = props => {
	const { validateId } = props

	const identity = useSelector(selectIdentity)

	const spinner = useSelector(state =>
		selectSpinnerById(state, CREATING_SESSION)
	)
	const walletMsgs = [
		{ message: 'PROCESSING_LOCAL_WALLET' },
		{ message: 'CREATING_SESSION_LOCAL_WALLET' },
	]

	const validations = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	const { wallet } = validations

	return (
		<ContentBox>
			{spinner ? (
				<FullContentMessage
					msgs={walletMsgs}
					spinner={true}
				></FullContentMessage>
			) : (
				<ContentBody>
					<Grid
						container
						spacing={2}
						// direction='row'
						alignContent='space-between'
						alignItems='center'
					>
						<Grid item xs={12}>
							<Grid container spacing={2}>
								<Grid item xs={12}>
									<TextField
										disabled={!!identity.authType}
										fullWidth
										variant='outlined'
										type='text'
										required
										label={t('email', { isProp: true })}
										name='email'
										value={identity.email || ''}
										onChange={ev =>
											execute(updateIdentity('email', ev.target.value))
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
									/>
								</Grid>
								{wallet && !!wallet.dirty && (
									<Grid item xs={12}>
										<Typography variant='body2' color='error' gutterBottom>
											{wallet.errMsg}
										</Typography>
									</Grid>
								)}
								<Grid item xs={12}>
									{!!identity.walletAddr && (
										<div>
											<Typography variant='body1' gutterBottom>
												{t('QUICK_IDENTITY_ADDRESS', {
													args: [identity.identityAddr],
												})}
											</Typography>
										</div>
									)}
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</ContentBody>
			)}
		</ContentBox>
	)
}

export default QuickLogin

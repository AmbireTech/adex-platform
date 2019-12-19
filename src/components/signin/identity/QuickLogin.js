import React from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { execute, updateIdentity } from 'actions'
import { t, selectIdentity, selectValidationsById } from 'selectors'

const QuickLogin = props => {
	const { validateId } = props

	const identity = useSelector(selectIdentity)
	const validations = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	const { wallet } = validations

	return (
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
						<Typography variant='body2' color='primary' gutterBottom>
							{t('QUICK_LOGIN_INFO', { args: [identity.email] })}
						</Typography>
					</Grid>

					<Grid item xs={12}>
						<TextField
							disabled={!!identity.authType}
							fullWidth
							type='text'
							required
							label={t('email', { isProp: true })}
							name='email'
							value={identity.email || ''}
							onChange={ev => execute(updateIdentity('email', ev.target.value))}
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
								<Typography variant='body1'>
									{t('QUICK_WALLET_ADDRESS', { args: [identity.walletAddr] })}
								</Typography>
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
	)
}

export default QuickLogin

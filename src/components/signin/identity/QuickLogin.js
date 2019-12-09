import React, { Component } from 'react'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class QuickLogin extends Component {
	render() {
		const {
			t,
			identity,
			handleChange,
			invalidFields,
			// classes,
			// actions
		} = this.props
		// Errors
		const { wallet } = invalidFields

		return (
			// <div>
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
								onChange={ev => handleChange('email', ev.target.value)}
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
			// </div>
		)
	}
}

const IdentityQuickLoginStep = IdentityHoc(QuickLogin)
export default Translate(withStyles(styles)(IdentityQuickLoginStep))

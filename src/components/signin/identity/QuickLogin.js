import React, { Component } from 'react'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { execute, validateQuickLogin } from 'actions'

class QuickLogin extends Component {
	componentDidMount() {
		this.validateWallet(false)
	}

	validateWallet = dirty => {
		const { handleChange, validate, save } = this.props
		execute(validateQuickLogin({ validate, handleChange, save, dirty }))
	}

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
							<Button
								variant='contained'
								color='primary'
								size='large'
								onClick={() => this.validateWallet(true)}
							>
								{t('LOG_IN_BTN')}
							</Button>
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

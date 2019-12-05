import React, { Component } from 'react'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getLocalWallet, migrateLegacyWallet } from 'services/wallet/wallet'
import { AUTH_TYPES } from 'constants/misc'

class QuickLogin extends Component {
	componentDidMount() {
		this.validateWallet(false)
	}

	validateWallet = dirty => {
		const { identity, handleChange, validate, save } = this.props
		const { password, email, authType } = identity
		if (!email) {
		}

		let wallet = {}
		let error = null

		try {
			if (email && password) {
				const walletData = getLocalWallet({
					email,
					password,
					authType,
				})

				if (!!walletData && walletData.data && walletData.data.address) {
					wallet = { ...walletData.data }
					wallet.email = email
					wallet.password = password
					wallet.authType = authType || AUTH_TYPES.GRANT.name
					wallet.identity = {
						address: walletData.identity,
						privileges: walletData.privileges || walletData.identityPrivileges,
					}

					if (!authType) {
						migrateLegacyWallet({ email, password })
						handleChange('deleteLegacyKey', true)
					}

					handleChange('identityAddr', walletData.identity)
				}

				handleChange('wallet', wallet)
				handleChange('walletAddr', wallet.address)
				handleChange('identityData', wallet.identity)
			}
		} catch (err) {
			console.error(err)
			error =
				(err && err.message ? err.message : err) || 'INVALID_EMAIL_OR_PASSWORD'
		}

		const isValid = !!wallet.address

		validate('wallet', {
			isValid,
			err: { msg: 'ERR_QUICK_WALLET_LOGIN', args: [error] },
			dirty: dirty,
		})

		if (isValid) {
			save()
		}
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

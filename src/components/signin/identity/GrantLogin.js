import React, { Component } from 'react'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getLocalWallet } from 'services/wallet/wallet'
import { AUTH_TYPES } from 'constants/misc'

class GrantLogin extends Component {
	componentDidMount() {
		this.validateWallet(false)
	}

	validateWallet = (dirty) => {
		const { identity, handleChange, validate } = this.props
		const { email, password, } = identity

		let wallet = {}

		if (email && password) {
			const walletData = getLocalWallet({
				email,
				password
			})

			if (!!walletData && walletData.data) {
				wallet = { ...walletData.data }
				wallet.email = email
				wallet.password = password
				wallet.authType = AUTH_TYPES.GRANT.name
				wallet.identity = {
					address: walletData.identity,
					privileges: walletData.identityPrivileges
				}
			}

			handleChange('wallet', wallet)
			handleChange('walletAddr', wallet.address)
			handleChange('identityData', wallet.identity)
		}

		validate('wallet', {
			isValid: !!wallet.address,
			err: { msg: 'ERR_LOCAL_WALLET_LOGIN' },
			dirty: dirty
		})
	}
	
	render() {
		const { t, identity, handleChange, invalidFields, classes, actions } = this.props
		// Errors
		const { wallet } = invalidFields
		return (
			// <div>
			<Grid
				container
				spacing={16}
				// direction='row'
				alignContent='space-between'
				alignItems='center'
			>
				<Grid item>
					<Grid
						container
						spacing={16}
					>
						<Grid item xs={12}>
							<Typography variant='body2' color='primary' gutterBottom>
								{t('GRANT_LOGIN_INFO')}
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
								onChange={(ev) => handleChange('email', ev.target.value)}
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
								onChange={(ev) => handleChange('password', ev.target.value)}
							/>
						</Grid>
						{(wallet && !!wallet.dirty) &&
						<Grid item xs={12}>
							<Typography variant='body2' color='error' gutterBottom>
								{wallet.errMsg}
							</Typography>
						</Grid>
						}
						<Grid item xs={12}>
							{(!!identity.walletAddr) &&
							<div>
								<Typography variant='body1' >
									{t('GRANT_WALLET_ADDRESS', { args: [identity.walletAddr] })}
								</Typography>
								<Typography variant='body1' gutterBottom>
									{t('GRANT_IDENTITY_ADDRESS', { args: [identity.identityAddr] })}
								</Typography>
							</div>
							}
							<Button
								variant='contained'
								color='primary'
								size='large'
								onClick={() => this.validateWallet(true)}
							>
								{t('CHECK_GRANT_IDENTITY')}
							</Button>
						</Grid>
					</Grid>

				</Grid>
				<Grid item xs={12}>
					<input
						accept="text/json"
						className={classes.input}
						id="contained-button-file"
						type="file"
						onChange={actions.onUploadLocalWallet}
					/>
					<label htmlFor="contained-button-file">
						<Button 							
							// variant="contained" 
							component="span" 
							className={classes.button}
						>
							{t('UPLOAD_ACCOUNT_DATA_JSON')}
						</Button>
					</label>
				</Grid>
			</Grid>
			// </div>
		)
	}
}

const IdentityGrantLoginStep = IdentityHoc(GrantLogin)
export default Translate(withStyles(styles)(IdentityGrantLoginStep))
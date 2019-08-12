import React, { Component } from 'react'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
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

const RRButton = withReactRouterLink(Button)

class QuickLogin extends Component {
	componentDidMount() {
		this.validateWallet(false)
	}

	validateWallet = (dirty) => {
		const { identity, handleChange, validate } = this.props
		const { password, email, type } = identity

		if (!email) {

		}

		let wallet = {}

		if (email && password) {
			const walletData = getLocalWallet({
				email,
				password,
				type
			})

			if (!!walletData && walletData.data) {
				wallet = { ...walletData.data }
				wallet.email = email
				wallet.password = password
				wallet.authType = AUTH_TYPES.QUICK.name
				wallet.identity = {
					address: walletData.identity,
					privileges: walletData.identityPrivileges
				}

				handleChange('identityAddr', walletData.identity)
			}

			handleChange('wallet', wallet)
			handleChange('walletAddr', wallet.address)
			handleChange('identityData', wallet.identity)
		}

		validate('wallet', {
			isValid: !!wallet.address,
			err: { msg: 'ERR_QUICK_WALLET_LOGIN' },
			dirty: dirty
		})
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

		if (!identity.email) {
			return (
				<RRButton
					to='/'
				>
					{'Email error'}
				</RRButton>
			)
		}

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
					<Grid
						container
						spacing={2}
					>
						<Grid item xs={12}>
							<Typography variant='body2' color='primary' gutterBottom>
								{t('QUICK_LOGIN_INFO', { args: [identity.email] })}
							</Typography>
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
										{t('QUICK_WALLET_ADDRESS', { args: [identity.walletAddr] })}
									</Typography>
									<Typography variant='body1' gutterBottom>
										{t('QUICK_IDENTITY_ADDRESS', { args: [identity.identityAddr] })}
									</Typography>
								</div>
							}
							<Button
								variant='contained'
								color='primary'
								size='large'
								onClick={() => this.validateWallet(true)}
							>
								{t('CHECK_QUICK_IDENTITY')}
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
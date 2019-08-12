import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getAuthLogo } from 'helpers/logosHelpers'
import Img from 'components/common/img/Img'
import classnames from 'classnames'
import { getAllWallets } from 'services/wallet/wallet'

const RRButton = withReactRouterLink(Button)

class AuthSelect extends Component {
	constructor(props) {
		super(props)

		this.state = {
			wallets: [],
			hasLegacyWallet: false
		}
	}

	componentDidMount() {
		// NOTE: reset identity if someone press backspace 
		// to go to this page
		// this.props.actions.resetIdentity()
		const allWallets = getAllWallets()
		const wallets = allWallets.filter(w => w.type !== 'legacy')
		const hasLegacyWallet = allWallets.length > wallets
		this.setState({ wallets, hasLegacyWallet })
	}

	render() {
		const { t, classes, actions } = this.props
		const { wallets, hasLegacyWallet } = this.state
		const { initQuickIdentity } = actions

		return (
			<div>
				<Grid
					container
					spacing={2}
					direction='column'
					alignItems='stretch'
				>
					{
						wallets.map(w =>
							<Grid
								key={w.name}
								item
								xs={12}
							>
								<RRButton
									variant='contained'
									to={`/login/quick`}
									size='large'
									color='primary'
									fullWidth
									onClick={initQuickIdentity({ email: w.name, type: w.type })}
								>
									{t('SIGN_IN_TO', { args: [w.name] })}
								</RRButton>
							</Grid>)
					}
					<Grid item xs={12}>
						<RRButton
							variant='contained'
							to='/identity/grant'
							size='large'
							color='primary'
							fullWidth
						>
							{t('CREATE_GRANT_ACCOUNT')}
						</RRButton>
					</Grid>
					{hasLegacyWallet &&
						<Grid item xs={12}>
							<RRButton
								variant='contained'
								to='/login/grant'
								size='large'
								color='secondary'
								fullWidth
							>
								{t('LOGIN_GRANT_ACCOUNT')}
							</RRButton>
						</Grid>
					}
					<Grid item xs={12}>
						<RRButton
							variant='contained'
							to='/login/full?metamask'
							size='large'
							color='default'
							fullWidth
							className={classes.metamaskBtn}
						>
							<Img
								src={getAuthLogo('metamask')}
								alt={t('AUTH_WITH_METAMASK')}
								className={classes.btnLogo}
							/>
							{t('METAMASK')}
						</RRButton>
					</Grid>
					<Grid item xs={12}>
						<RRButton
							variant='contained'
							to='/login/full?trezor'
							size='large'
							color='default'
							fullWidth
							className={classes.trezorBtn}
						>
							<Img
								src={getAuthLogo('trezor')}
								alt={t('AUTH_WITH_TREZOR')}
								className={classnames(
									classes.btnLogo,
									classes.btnLogoNoTxt
								)}
							/>
							{/* {t('TREZOR')} */}
						</RRButton>
					</Grid>

				</Grid>
			</div >
		)
	}
}

export default Translate(withStyles(styles)(AuthSelect))

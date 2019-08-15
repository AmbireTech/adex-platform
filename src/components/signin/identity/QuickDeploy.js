import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { createLocalWallet } from 'services/wallet/wallet'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { AUTH_TYPES } from 'constants/misc'

class QuickDeploy extends Component {

	componentDidMount() {
		this.validateIdentity()
		if (!this.props.identity.identityAddr) {
			this.initLocalWallet()
		}
	}

	componentDidUpdate(prevProps) {
		const currIdentity = this.props.identity.identityAddr
		if (!!currIdentity &&
			(currIdentity !== prevProps.identity.identityAddr)) {
			this.validateIdentity()
		}
	}

	validateIdentity = () => {
		const { validate, identity } = this.props
		const { identityAddr } = identity

		validate('identityAddr', {
			isValid: !!identityAddr,
			err: { msg: 'ERR_IDENTITY_NOT_GENERATED' },
			dirty: false
		})
	}

	initLocalWallet = () => {
		const { handleChange, identity, actions } = this.props
		const { email, password } = identity

		const walletData = createLocalWallet({
			email,
			password
		})

		walletData.authType = AUTH_TYPES.QUICK.name
		walletData.email = email
		walletData.password = password

		const walletAddr = walletData.address

		actions.getIdentityTxData({
			owner: walletAddr,
			privLevel: 3
		})

		handleChange('wallet', walletData)
		handleChange('walletAddr', walletAddr)
	}

	render() {
		const { t, identity, classes, waitingQuick } = this.props
		const { walletAddr, identityAddr } = identity

		return (
			<div>
				<Grid
					container
					spacing={2}
				>
					<Grid item sm={12}>
						<Typography paragraph variant='subheading'>
							{t('QUICK_WALLET_ADDRESS')}
							{' ' + walletAddr}
						</Typography>
						<Typography paragraph variant='body2'>
							{t('QUICK_WALLET_ADDRESS_INFO')}
						</Typography>
						<Typography paragraph variant='subheading'>
							{t('IDENTITY_ADDRESS_INFO', {
								args: [identityAddr]
							})}
						</Typography>
					</Grid>
					{

						<Grid item sm={12}>
							{!!identityAddr
								? <Typography paragraph variant='subheading'>
									{t('IDENTITY_ADDRESS_INFO', {
										args: [identityAddr]
									})}
								</Typography>
								:
								<div>
									<Typography paragraph variant='subheading'>
										{t('IDENTITY_ADDRESS_INFO_1')}
									</Typography>
									{/* <span className={classes.buttonProgressWrapper}>
										<Button
											variant='contained'
											color='primary'
											size='large'
											onClick={this.getIdentity}
											disabled={waitingQuick}
										>
											{t('GET_QUICK_IDENTITY')}
										</Button>
										{waitingQuick &&
											<CircularProgress
												size={24}
												className={classes.buttonProgress}
											/>}
									</span > */}
								</div>
							}
						</Grid>
					}
				</Grid>
			</div>
		)
	}
}

QuickDeploy.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
	const { memory } = state

	return {
		waitingQuick: memory.spinners['getting-quick-identity']
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const IdentityQuickDeployStep = IdentityHoc(QuickDeploy)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(IdentityQuickDeployStep)))
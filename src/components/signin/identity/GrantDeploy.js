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

class GrantDeploy extends Component {

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
		const { handleChange, identity } = this.props
		const { email, password } = identity

		const walletData = createLocalWallet({
			email,
			password
		})

		handleChange('wallet', walletData)
		handleChange('walletAddr', walletData.address)
	}

	getIdentity = () => {
		const { identity, actions } = this.props
		const { email, coupon, walletAddr } = identity

		actions.getGrantAccount({
			walletAddr,
			email,
			coupon: coupon
		})
	}

	render() {
		const { t, identity, classes, spinner } = this.props
		const { walletAddr, identityAddr, grantAmount } = identity

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item sm={12}>
						<Typography paragraph variant='subheading'>
							{t('GRANT_WALLET_ADDRESS')}
							{' ' + walletAddr}
						</Typography>
						<Typography paragraph variant='body2'>
							{t('GRANT_WALLET_ADDRESS_INFO')}
						</Typography>


					</Grid>
					{

						<Grid item sm={12}>
							{!!identityAddr
								? <Typography paragraph variant='subheading'>
									{t('IDENTITY_ADDRESS_INFO', {
										args: [identityAddr, grantAmount]
									})}
								</Typography>
								:
								<div>
									<Typography paragraph variant='subheading'>
										{t('IDENTITY_ADDRESS_INFO_1')}
									</Typography>
									<span className={classes.buttonProgressWrapper}>
										<Button
											variant='contained'
											color='primary'
											size='large'
											onClick={this.getIdentity}
											disabled={spinner}
										>
											{t('GET_GRANT_IDENTITY')}
										</Button>
										{spinner &&
											<CircularProgress
												size={24}
												className={classes.buttonProgress}
											/>}
									</span >
								</div>
							}
						</Grid>
					}
				</Grid>
			</div>
		)
	}
}

GrantDeploy.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
	const { memory } = state

	return {
		spinner: memory.spinners['getting-grant-identity']
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const IdentityGrantDeployStep = IdentityHoc(GrantDeploy)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(IdentityGrantDeployStep)))
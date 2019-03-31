import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { generateRandomWallet, createLocalWallet } from 'services/wallet/wallet'
import { encrypt, decrypt } from 'services/crypto/crypto'
import { loadFromLocalStorage, saveToLocalStorage } from 'helpers/localStorageHelpers'
import { grantAccount } from 'services/adex-relayer/actions'
import IdentityHoc from './IdentityHoc'
// import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class GrantDeploy extends Component {

	componentDidMount() {			
		this.validateIdentity()
		if(!this.props.identity.identityAddr) {
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
		const { t, identity, handleChange } = this.props
		const { walletAddr, identityAddr } = identity

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item sm={12}>
						<Typography paragraph variant='subheading'>
							{t('WALLET_ADDRESS')}
							{' ' + walletAddr}
						</Typography>


					</Grid>
					{

						<Grid item sm={12}>
							{!!identityAddr
								? <Typography paragraph variant='subheading'>
									{t('IDENTITY_ADDRESS_INFO')}
									{' ' + identityAddr}
								</Typography>
								: <Button
									variant='contained'
									color='primary'
									size='large'
									onClick={this.getIdentity}
								>
									{'GET_GRANT_IDENTITY'}
								</Button>
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
	const { persist, memory} = state

	return {
		account: persist.account,
		wallet: memory.wallet
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
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { generateRandomWallet } from 'services/wallet/wallet'
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

	constructor(props, context) {
		super(props, context)
		this.state = {
			// mnemonic: props.wallet.mnemonic
			// identityAddr: ''
		}
	}

	componentWillMount() {
		this.props.validate('identityAddr', {
			isValid: !!this.props.identity.identityAddr,
			err: { msg: 'ERR_IDENTITY_NOT_GENERATED' },
			dirty: false
		})

		this.createLocalWallet()
	}

	// TODO: as service
	createLocalWallet = () => {
		const { handleChange, identity } = this.props
		const { email, password } =
			// identity || 
			{ email: 'ivo.paunov@gmail.com', password: 'passWord123' }
		const walletData =	generateRandomWallet()


		const data = JSON.stringify(walletData)

		const encrKey = encrypt(email, password)
		const encrData = encrypt(data, email + password)

		saveToLocalStorage(encrData, encrKey)

		handleChange('wallet', walletData)
		handleChange('walletAddr', walletData.address)
	}

	// TODO: make it action
	senIdentity = () => {
		const { handleChange, identity } = this.props
		const { email, coupon, wallet } = identity
		grantAccount({
			ownerAddr: wallet.address || '0x2aecF52ABe359820c48986046959B4136AfDfbe2',
			mail: email || 'ivo.paunov@gmail.com',
			couponCode: coupon || 'ch3r787h4v9h3rouh3rf987jver9ujhIJUjuih83nh083d'
		}).then(res => {
			console.log('deploy res', res)
			handleChange('identityAddr', res.deployData.idContractAddr)
			this.props.validate('identityAddr', {
				isValid: true,
				err: { msg: 'ERR_IDENTITY_NOT_GENERATED' },
				dirty: true
			})
		})
			.catch(err => {
				// TODO: err msg
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
									onClick={this.senIdentity}
								>
									{'SEND_GRANT_IDENTITY'}
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
	let persist = state.persist
	let memory = state.memory
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
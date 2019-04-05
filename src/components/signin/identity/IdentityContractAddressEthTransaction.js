import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { deployIdentityContract } from 'services/smart-contracts/actions/identity'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { registerFullIdentity } from 'services/adex-relayer/actions'

class IdentityContractAddressEthTransaction extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			waitingIdentityDeploy: false,
			identityDeployed: false
		}
	}

	componentDidMount() {
		this.validateRegistered(
			this.props.identity.isRegistered
		)
	}

	validateRegistered = (isRegistered, dirty) => {
		const { validate } = this.props
		validate('isRegistered', {
			isValid: !!isRegistered,
			err: { msg: 'ERR_IDENTITY_NOT_REGISTERED' },
			dirty: dirty
		})
	}

	deployIdentity = async () => {
		const { identity } = this.props
		const {
			identityTxData,
			wallet,
			identityAddr,
			email

		} = identity

		const account = {
			_wallet: wallet,
			_settings: {}
		}

		const tx = await deployIdentityContract({
			...identityTxData,
			wallet
		})

		const regInfo = await registerFullIdentity({
			txHash: tx.hash,
			identity: identityAddr,
			privileges: [wallet.address, 3],
			mail: email
		})

		if (regInfo) {
			this.validateRegistered(true, false)
		}
	}

	render() {
		const { identity, t, classes, handleChange } = this.props
		const { identityContractAddress } = identity || {}

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item sm={6}>
						<Button
							onClick={this.deployIdentity}
						>
							{'SEND_IDENTITY_TX_NOW'}
						</Button>
						<div>
							{identityContractAddress || ''}
						</div>

					</Grid>
				</Grid>
			</div >
		)
	}
}

IdentityContractAddressEthTransaction.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
	let persist = state.persist
	// let memory = state.memory
	return {
		account: persist.account,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const IdentityContractAddressStep = IdentityHoc(IdentityContractAddressEthTransaction)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(IdentityContractAddressStep)))
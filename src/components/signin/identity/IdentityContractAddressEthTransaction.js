import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class IdentityContractAddressEthTransaction extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			waitingIdentityDeploy: false,
			identityDeployed: false
		}
	}

	componentDidMount() {
		this.validateRegistered()
	}

	componentDidUpdate(prevProps) {
		if (prevProps.identity.isRegistered
			!== this.props.identity.isRegistered) {
			this.validateRegistered()
		}
	}

	validateRegistered = () => {
		const { validate, identity } = this.props
		validate('isRegistered', {
			isValid: !!identity.isRegistered,
			err: { msg: 'ERR_IDENTITY_NOT_REGISTERED' },
			dirty: false
		})
	}

	deployIdentity = async () => {
		const { identity, actions } = this.props
		const {
			identityTxData,
			wallet,
			identityAddr,
			email

		} = identity

		actions.deployFullIdentity({
			wallet,
			email,
			identityAddr,
			identityTxData
		})
	}

	render() {
		const { identity, t, classes, handleChange } = this.props
		const { identityAddr } = identity || {}

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item sm={12} >
						<Paper className={classes.infoPaper} elevation={1}>
							<Typography variant="h5" component="h3">
								{identityAddr}
							</Typography>
							<Typography component="p">
								{t('IDENTITY_PREDEPLOY_INFO')}
							</Typography>
						</Paper>
					</Grid>
					<Grid item sm={6}>

						<Button
							onClick={this.deployIdentity}
							variant='contained'
						>
							{t('SIGN_IDENTITY_TX_NOW')}
						</Button>

					</Grid>
				</Grid>
			</div >
		)
	}
}

IdentityContractAddressEthTransaction.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	identity: PropTypes.object.isRegistered,
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
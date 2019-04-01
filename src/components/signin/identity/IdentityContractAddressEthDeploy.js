import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import GasPrice from 'components/dashboard/account/GasPrice'
import { getDeployTx, getRandomAddressForDeployTx } from 'services/idenity/contract-address'
import { validEmail } from 'helpers/validators'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class IdentityContractAddressEthDeploy extends Component {

	componentDidMount() {
		this.validateIdentity()
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

	validateEmail(email, dirty) {
		const isValid = validEmail(email)
		this.props.validate('email', {
			isValid: isValid,
			err: { msg: 'ERR_EMAIL' },
			dirty: dirty
		})
	}

	validateEmailCheck(emailCheck, email, dirty) {
		const isValid = !!emailCheck && !!email && (emailCheck === email)
		this.props.validate('emailCheck', {
			isValid: isValid,
			err: { msg: 'ERR_EMAIL_CHECK' },
			dirty: dirty
		})
	}

	getIdentityContractAddress = () => {
		const { identityContractOwner } = this.props.identity

		// TODO: deployTx.gasPrice

		const deployTx = getDeployTx({
			addrs: [identityContractOwner],
			privLevels: [3],
			feeTokenAddr: identityContractOwner,
			feeBeneficiary: identityContractOwner,
			feeTokenAmount: '0'
		})

		const addrData = getRandomAddressForDeployTx({ deployTx })
		this.props.handleChange('identityAddr', addrData.idContractAddr)
		this.props.handleChange('identityTxData', addrData)
	}

	render() {
		const { t, identity, handleChange, invalidFields } = this.props
		const { identityAddr } = identity
		// Errors
		const { email, emailCheck } = invalidFields

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item xs={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('email', { isProp: true })}
							name='email'
							value={identity.email || ''}
							onChange={(ev) => handleChange('email', ev.target.value)}
							onBlur={() => this.validateEmail(identity.email, true)}
							onFocus={() => this.validateEmail(identity.email, false)}
							error={email && !!email.dirty}
							maxLength={128}
							helperText={
								email && !!email.dirty ?
									email.errMsg :
									t('ENTER_VALID_EMAIL')
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('emailCheck', { isProp: true })}
							name='emailCheck'
							value={identity.emailCheck || ''}
							onChange={(ev) => handleChange('emailCheck', ev.target.value)}
							onBlur={() => this.validateEmailCheck(identity.emailCheck, identity.email, true)}
							onFocus={() => this.validateEmailCheck(identity.emailCheck, identity.email, false)}
							error={emailCheck && !!emailCheck.dirty}
							maxLength={128}
							helperText={
								emailCheck && !!emailCheck.dirty ?
									emailCheck.errMsg :
									t('ENTER_SAME_EMAIL')
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<GasPrice />
					</Grid>
					<Grid item xs={12}>
						{!identityAddr
							? <Button
								variant='contained'
								color='primary'
								onClick={this.getIdentityContractAddress}
							>
								{t('GENERATE_IDENTITY_ADDRESS')}
							</Button>
							:
							<div>
								<Typography paragraph variant='subheading'>
									{t('IDENTITY_CONTRACT_ADDRESS_INFO')}
								</Typography>
								<Typography paragraph variant='subheading'>
									{t('IDENTITY_CONTRACT')}
								</Typography>
								<Typography paragraph variant='subheading'>
									{identityAddr}
								</Typography>
							</div>
						}
					</Grid>
				</Grid>
			</div >
		)
	}
}

IdentityContractAddressEthDeploy.propTypes = {
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

const IdentityContractAddressStep = IdentityHoc(IdentityContractAddressEthDeploy)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(IdentityContractAddressStep)))
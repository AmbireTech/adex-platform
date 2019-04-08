import React, { Component } from 'react'
import PropTypes from 'prop-types'
import IdentityHoc from './IdentityHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { validEmail } from 'helpers/validators'
import {
	getIdentityDeployData
} from 'services/smart-contracts/actions/identity'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class IdentityContractAddressEthDeploy extends Component {

	componentDidMount() {
		this.validateIdentity()
		this.validateEmail(this.props.identity.email, false)
		this.validateEmailCheck(this.props.identity.emailCheck, false)
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

	getIdentityContractData = async () => {
		const { wallet } = this.props.identity

		// TODO: action
		const txData = await getIdentityDeployData({
			owner: wallet.address,
			privLevel: 3
		})

		this.props.handleChange('identityAddr', txData.expectedAddr)
		this.props.handleChange('identityTxData', txData)
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
						<Typography paragraph variant='body1'>
							{t('GENERATE_FULL_IDENTITY_INFO_EMAIL')}
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
						<Typography paragraph variant='body1'>
							{t('GENERATE_FULL_IDENTITY_INFO_ADDRESS')}
						</Typography>
						{!identityAddr
							?
							<Button
								variant='contained'
								color='primary'
								onClick={this.getIdentityContractData}
							>
								{t('GENERATE_IDENTITY_ADDRESS')}
							</Button>
							:
							<div>
								<Typography paragraph variant='subtitle2' color='primary'>
									{t('IDENTITY_CONTRACT_IS', { args: [identityAddr] })}
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
	account: PropTypes.object.isRequired,
	identity: PropTypes.object.isRequired,
	handleChange: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
	invalidFields: PropTypes.object.isRequired,
	validate: PropTypes.func.isRequired
}

const IdentityContractAddressStep = IdentityHoc(IdentityContractAddressEthDeploy)
export default Translate(withStyles(styles)(IdentityContractAddressStep))
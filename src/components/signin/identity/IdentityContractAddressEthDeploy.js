import React, { Component } from 'react'
import PropTypes from 'prop-types'
import IdentityHoc from './IdentityHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import {
	validEmail,
	validQuickAccountCoupon
} from 'helpers/validators'
import { checkAccessCode } from 'services/adex-relayer/actions'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const ACCESS_CODE_CHECK = !process.env.ACCESS_CODE_CHECK

class IdentityContractAddressEthDeploy extends Component {

	componentDidMount() {
		const {
			email,
			emailCheck,
			code
		} = this.props.identity

		this.validateIdentity()
		this.validateEmail(email, false)
		this.validateEmailCheck(emailCheck, false)
		ACCESS_CODE_CHECK && this.validateCode(code, false)
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

	validateCode(code, dirty) {
		const isValidFormat = validQuickAccountCoupon(code)

		if (!isValidFormat) {
			this.props.validate('code', {
				isValid: isValidFormat,
				err: { msg: 'ERR_ACCESS_CODE_FORMAT' },
				dirty: dirty
			})
		} else {
			this.setState({ waitingCheck: true }, () => {
				checkAccessCode({ code })
					.then((cpn = {}) => {
						const isValid = (cpn.exist === true) && (cpn.used === false)
						let msg = ''
						if (cpn.exist === false) {
							msg = 'ERR_ACCESS_CODE_NOT_EXIST'
						} else if (cpn.used === true) {
							msg = 'ERR_ACCESS_CODE_USED'
						}

						this.props.validate('code', {
							isValid: isValid,
							err: { msg: msg },
							dirty: dirty
						})
					})
					.catch(err => {
						this.props.validate('code', {
							isValid: false,
							err: { msg: 'ERR_ACCESS_CODE_NETWORK' },
							dirty: true
						})
					})
			})
		}
	}

	getIdentityContractData = async () => {
		const { actions, identity } = this.props
		const { wallet } = identity

		actions.getFullIdentityTxData({
			owner: wallet.address,
			privLevel: 3
		})
	}

	render() {
		const { t, identity, handleChange, invalidFields } = this.props
		const { identityAddr } = identity
		// Errors
		const { email, emailCheck, code } = invalidFields

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					{ACCESS_CODE_CHECK &&
						<Grid item xs={12}>
							<Typography paragraph variant='body1'>
								{t('ACCESS_CODE_INFO')}
							</Typography>
						</Grid>
					}
					{ACCESS_CODE_CHECK &&
						<Grid item xs={12}>
							<TextField
								fullWidth
								type='text'
								required
								label={t('code', { isProp: true })}
								name='code'
								value={identity.code || ''}
								onChange={(ev) => handleChange('code', ev.target.value)}
								onBlur={() => this.validateCode(identity.code, true)}
								onFocus={() => this.validateCode(identity.code, false)}
								error={code && !!code.dirty}
								maxLength={128}
								helperText={
									code && !!code.dirty ?
										code.errMsg :
										t('ENTER_VALID_CODE')
								}
							/>
						</Grid>
					}

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
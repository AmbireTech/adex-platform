import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Button from '@material-ui/core/Button'
// import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { validQuickAccountCoupon } from 'helpers/validators'
import { checkCoupon } from 'services/adex-relayer/actions'

// TEST COUPON: ch3r787h4v9h3rouh3rf987jver9ujhIJUjuih83nh083d

class CouponCheck extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			waitingCheck: false
		}
	}

	componentDidMount() {
		this.props.validate('coupon', {
			isValid: !!this.props.identity.coupon,
			err: { msg: 'ERR_NO_COUPON' },
			dirty: false
		})
	}

	validateCoupon(coupon, dirty) {
		const isValidFormat = validQuickAccountCoupon(coupon)

		if (!isValidFormat) {
			this.props.validate('coupon', {
				isValid: isValidFormat,
				err: { msg: 'ERR_COUPON_FORMAT' },
				dirty: dirty
			})
		} else {
			this.setState({ waitingCheck: true }, () => {
				checkCoupon({ coupon })
					.then((cpn = {}) => {
						const isValid = (cpn.exist === true) && (cpn.used === false)
						let msg = ''
						if (cpn.exist === false) {
							msg = 'ERR_COUPON_NOT_EXIST'
						} else if(cpn.used === true) {
							msg = 'ERR_COUPON_USED'							
						}

						this.props.validate('coupon', {
							isValid: isValid,
							err: { msg: msg },
							dirty: dirty
						})
					})
			})
		}
	}

	render() {
		const { t, identity, handleChange, invalidFields } = this.props
		// Errors
		const { coupon } = invalidFields
		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('coupon', { isProp: true })}
							name='coupon'
							value={identity.coupon}
							onChange={(ev) => handleChange('coupon', ev.target.value)}
							// onBlur={() => this.validateCoupon(identity.coupon, true)}
							// onFocus={() => this.validateCoupon(identity.coupon, false)}
							error={coupon && !!coupon.dirty}
							maxLength={128}
							helperText={
								coupon && !!coupon.dirty ?
									coupon.errMsg :
									t('ENTER_VALID_COUPON')
							}
						/>
					</Grid>
					<Grid item sm={12}>
						<Button
							variant='contained'
							color='primary'
							onClick={() => this.validateCoupon(identity.coupon, true)}
						>
							{t('VALIDATE_COUPON')}
						</Button>
					</Grid>
				</Grid>
			</div>
		)
	}
}

CouponCheck.propTypes = {
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

const IdentityCouponCheckStep = IdentityHoc(CouponCheck)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(IdentityCouponCheckStep)))
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
// import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { validQuickAccountCoupon} from 'helpers/validators'

// TEST COUPON: ch3r787h4v9h3rouh3rf987jver9ujhIJUjuih83nh083d

class CouponCheck extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			mnemonic: props.wallet.mnemonic
		}
	}

	componentDidMount() {
		this.props.validate('coupon', {
			isValid: !!this.props.identity.coupon,
			err: { msg: 'ERR_NO_COUPON' },
			dirty: false
		})
		// this.props.validate('couponCheck', {
		//     isValid: !!this.props.identity.couponCheck,
		//     err: { msg: 'ERR_NO_COUPON_CHECK' },
		//     dirty: false
		// })
	}

	validateCoupon(coupon, dirty) {
		const isValid = validQuickAccountCoupon(coupon)
		this.props.validate('coupon', {
			isValid: isValid,
			err: { msg: 'ERR_COUPON' },
			dirty: dirty
		})
	}

	validateCouponCheck(couponCheck, dirty) {
		// TODO: check relayer before asking user to do reg

		const isValid = false // TODO

		this.props.validate('couponCheck', {
			isValid: isValid,
			err: { msg: 'ERR_COUPON_CHECK' },
			dirty: dirty
		})
	}

	render() {
		const { t, identity, handleChange, invalidFields } = this.props
		// Errors
		const { coupon, couponCheck } = invalidFields
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
							onBlur={() => this.validateCoupon(identity.coupon, true)}
							onFocus={() => this.validateCoupon(identity.coupon, false)}
							error={coupon && !!coupon.dirty}
							maxLength={128}
							helperText={
								coupon && !!coupon.dirty ?
									coupon.errMsg :
									t('ENTER_VALID_COUPON')
							}
						/>
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
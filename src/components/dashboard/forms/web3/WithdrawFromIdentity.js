import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import TextField from '@material-ui/core/TextField'
import { validateNumber, isEthAddress } from 'helpers/validators'

class WithdrawFromIdentity extends Component {
	componentDidMount() {
		if (!this.props.transaction.withdrawAmount) {
			this.props.validate('withdrawAmount', {
				isValid: false,
				err: { msg: 'ERR_REQUIRED_FIELD' },
				dirty: false,
			})
		}
	}

	validateAmount = (numStr, dirty) => {
		let isValid = validateNumber(numStr)
		let msg = 'ERR_INVALID_AMOUNT_VALUE'
		let errMsgArgs = []
		if (
			isValid &&
			parseFloat(numStr) > parseFloat(this.props.identityAvailable)
		) {
			isValid = false
			msg = 'ERR_MAX_AMOUNT_TO_WITHDRAW'
			errMsgArgs = [this.props.identityAvailable, 'DAI']
		}

		this.props.validate('withdrawAmount', {
			isValid: isValid,
			err: { msg: msg, args: errMsgArgs },
			dirty: dirty,
		})
	}

	validateAddress = (addr, dirty) => {
		const isValid = isEthAddress(addr)
		const msg = 'ERR_INVALID_ETH_ADDRESS'
		this.props.validate('withdrawTo', {
			isValid: isValid,
			err: { msg: msg },
			dirty: dirty,
		})
	}

	render() {
		const {
			transaction,
			t,
			invalidFields,
			identityAvailable,
			handleChange,
		} = this.props
		const { withdrawTo, withdrawAmount } = transaction || {}
		const errAmount = invalidFields['withdrawAmount']
		const errAddr = invalidFields['withdrawTo']

		return (
			<div>
				<div>
					{' '}
					{t('EXCHANGE_CURRENT_DAI_BALANCE_AVAILABLE_ON_IDENTITY')}{' '}
					{identityAvailable}{' '}
				</div>
				<TextField
					type='text'
					required
					fullWidth
					label={t('WITHDRAW_TO')}
					name='withdrawTo'
					value={withdrawTo || ''}
					onChange={ev => handleChange('withdrawTo', ev.target.value)}
					onBlur={() => this.validateAddress(withdrawTo, true)}
					onFocus={() => this.validateAddress(withdrawTo, false)}
					error={errAddr && !!errAddr.dirty}
					helperText={errAddr && !!errAddr.dirty ? errAddr.errMsg : ''}
				/>
				<TextField
					type='text'
					fullWidth
					required
					label={t('TOKENS_TO_WITHDRAW')}
					name='withdrawAmount'
					value={withdrawAmount || ''}
					onChange={ev => handleChange('withdrawAmount', ev.target.value)}
					onBlur={() => this.validateAmount(withdrawAmount, true)}
					onFocus={() => this.validateAmount(withdrawAmount, false)}
					error={errAmount && !!errAmount.dirty}
					helperText={
						errAmount && !!errAmount.dirty
							? errAmount.errMsg
							: t('MAX_AMOUNT_TO_WITHDRAW', {
									args: [identityAvailable, 'DAI'],
							  })
					}
				/>
			</div>
		)
	}
}

WithdrawFromIdentity.propTypes = {
	actions: PropTypes.object.isRequired,
	label: PropTypes.string,
	txId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	transaction: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
	// const persist = state.persist
	// const memory = state.memory
	const txId = props.stepsId
	return {
		txId: txId,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

const WithdrawFromIdentityForm = NewTransactionHoc(WithdrawFromIdentity)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(WithdrawFromIdentityForm)

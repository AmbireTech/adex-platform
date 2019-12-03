import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import TextField from '@material-ui/core/TextField'
import { validateNumber } from 'helpers/validators'
import { InputLoading } from 'components/common/spinners/'

class WithdrawAnyTokenFromIdentity extends Component {
	componentDidMount() {
		const { validate, transaction } = this.props
		// If nothing entered will validate
		if (!transaction.withdrawAmount) {
			validate('withdrawAmount', {
				isValid: true,
				dirty: false,
			})
		}
		if (!transaction.withdrawTo) {
			validate('withdrawTo', {
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
		let amount = parseFloat(numStr)
		if (isValid && amount > parseFloat(this.props.identityAvailable)) {
			isValid = false
			msg = 'ERR_MAX_AMOUNT_TO_WITHDRAW'
			errMsgArgs = [this.props.identityAvailable, 'SAI']
		}

		this.props.validate('withdrawAmount', {
			isValid: isValid,
			err: { msg: msg, args: errMsgArgs },
			dirty: dirty,
		})
	}

	render() {
		const {
			actions,
			validate,
			transaction,
			t,
			invalidFields,
			handleChange,
			withdrawToSpinner,
			balanceAnySpinner,
		} = this.props
		const { withdrawTo, withdrawAmount, tokenAddress, tokenBalance } =
			transaction || {}
		const errAmount = invalidFields['withdrawAmount']
		const errAddr = invalidFields['withdrawTo']
		const errToken = invalidFields['tokenAddress']
		return (
			<div>
				<div>
					{' '}
					{t('EXCHANGE_CURRENT_BALANCE_AVAILABLE_ON_IDENTITY')} {tokenBalance}{' '}
				</div>
				<TextField
					disabled={balanceAnySpinner}
					type='text'
					required
					fullWidth
					label={t('WITHDRAW_TOTOKE_ADDRESS')}
					name='tokenAddress'
					value={tokenAddress || ''}
					onChange={ev => handleChange('tokenAddress', ev.target.value)}
					onBlur={() =>
						actions.validateAddress({
							addr: tokenAddress,
							dirty: true,
							validate,
							name: 'tokenAddress',
							setBalance: bal => handleChange('tokenBalance', bal),
						})
					}
					onFocus={() =>
						actions.validateAddress({
							addr: tokenAddress,
							dirty: false,
							validate,
							name: 'tokenAddress',
							setBalance: bal => handleChange('tokenBalance', bal),
						})
					}
					error={errToken && !!errToken.dirty}
					helperText={errToken && !!errToken.dirty ? errToken.errMsg : ''}
				/>
				{balanceAnySpinner ? <InputLoading /> : null}
				<TextField
					disabled={withdrawToSpinner}
					type='text'
					required
					fullWidth
					label={t('WITHDRAW_TO')}
					name='withdrawTo'
					value={withdrawTo || ''}
					onChange={ev => handleChange('withdrawTo', ev.target.value)}
					onBlur={() =>
						actions.validateAddress({
							addr: withdrawTo,
							dirty: true,
							validate,
							name: 'withdrawTo',
						})
					}
					onFocus={() =>
						actions.validateAddress({
							addr: withdrawTo,
							dirty: false,
							validate,
							name: 'withdrawTo',
						})
					}
					error={errAddr && !!errAddr.dirty}
					helperText={errAddr && !!errAddr.dirty ? errAddr.errMsg : ''}
				/>
				{withdrawToSpinner ? <InputLoading /> : null}
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
							: t('MAX_AMOUNT_TO_WITHDRAW_ANY', {
									args: [tokenBalance],
							  })
					}
				/>
			</div>
		)
	}
}

WithdrawAnyTokenFromIdentity.propTypes = {
	actions: PropTypes.object.isRequired,
	label: PropTypes.string,
	txId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	transaction: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
	// const persist = state.persist
	const memory = state.memory
	const txId = props.stepsId
	return {
		txId: txId,
		withdrawToSpinner: memory.spinners['withdrawTo'],
		balanceAnySpinner: memory.spinners['tokenAddress'],
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

const WithdrawAnyTokenFromIdentityForm = NewTransactionHoc(
	WithdrawAnyTokenFromIdentity
)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(WithdrawAnyTokenFromIdentityForm)

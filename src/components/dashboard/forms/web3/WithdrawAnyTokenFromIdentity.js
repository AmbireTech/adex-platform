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
		if (!transaction.amountToWithdraw) {
			validate('amountToWithdraw', {
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
		if (!transaction.tokenAddress) {
			validate('tokenAddress', {
				isValid: false,
				err: { msg: 'ERR_REQUIRED_FIELD' },
				dirty: false,
			})
		}
	}

	validateAmount = (numStr, dirty) => {
		let isValid = validateNumber(numStr)
		let msg = 'ERR_INVALID_AMOUNT_VALUE'

		this.props.validate('amountToWithdraw', {
			isValid: isValid,
			err: { msg: msg },
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
		const {
			withdrawTo,
			amountToWithdraw,
			tokenAddress,
			tokenBalance,
			tokenDecimals,
		} = transaction || {}
		const errAmount = invalidFields['amountToWithdraw']
		const errAddr = invalidFields['withdrawTo']
		const errToken = invalidFields['tokenAddress']
		return (
			<div>
				<TextField
					disabled={balanceAnySpinner}
					type='text'
					required
					fullWidth
					label={t('WITHDRAW_TOKEN_ADDRESS')}
					name='tokenAddress'
					value={tokenAddress || ''}
					onChange={ev => handleChange('tokenAddress', ev.target.value)}
					onBlur={() =>
						actions.validateAddress({
							addr: tokenAddress,
							dirty: true,
							validate,
							name: 'tokenAddress',
						})
					}
					onFocus={() =>
						actions.validateAddress({
							addr: tokenAddress,
							dirty: false,
							validate,
							name: 'tokenAddress',
						})
					}
					error={errToken && !!errToken.dirty}
					helperText={errToken && !!errToken.dirty ? errToken.errMsg : ''}
				/>

				<TextField
					type='text'
					fullWidth
					required
					label={t('TOKENS_TO_WITHDRAW_DECIMALS')}
					name='tokenDecimals'
					value={tokenDecimals || ''}
					onChange={ev => handleChange('tokenDecimals', ev.target.value)}
				/>
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
							nonERC20: true,
						})
					}
					onFocus={() =>
						actions.validateAddress({
							addr: withdrawTo,
							dirty: false,
							validate,
							name: 'withdrawTo',
							nonERC20: true,
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
					label={t('TOKENS_AMOUNT_TO_WITHDRAW')}
					name='amountToWithdraw'
					value={amountToWithdraw || ''}
					onChange={ev => handleChange('amountToWithdraw', ev.target.value)}
					onBlur={() => this.validateAmount(amountToWithdraw, true)}
					onFocus={() => this.validateAmount(amountToWithdraw, false)}
					error={errAmount && !!errAmount.dirty}
					helperText={
						errAmount && !!errAmount.dirty
							? errAmount.errMsg
							: t('MAX_AMOUNT_TO_WITHDRAW', {
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

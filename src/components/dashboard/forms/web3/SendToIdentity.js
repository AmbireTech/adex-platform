import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import TextField from '@material-ui/core/TextField'
import { validations } from 'adex-models'
import { parseUnits, bigNumberify } from 'ethers/utils'

class SendToIdentity extends Component {

	componentDidMount() {
		if (!this.props.transaction.amountToSend) {
			this.props.validate('amountToSend', {
				isValid: false,
				err: { msg: 'ERR_REQUIRED_FIELD' },
				dirty: false
			})
		}
	}

	validateAmount = (numStr, dirty) => {
		let isValid = validations.isNumberString(numStr)
		let msg = 'ERR_INVALID_AMOUNT_VALUE'
		const errMsgArgs = []

		const { validate, account } = this.props
		const { walletBalanceDai } = account.stats.raw
		if (isValid && (bigNumberify(walletBalanceDai).lt(parseUnits(numStr, 18)))) {
			isValid = false
			msg = 'ERR_MAX_AMOUNT_TO_DEPOSIT'
			errMsgArgs.push(this.props.addrBalanceAdx, 'DAI')
		}

		validate('amountToSend', { isValid: isValid, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
	}

	render() {
		const { transaction, t, invalidFields, account, handleChange } = this.props
		const { walletBalanceDai } = account.stats.formatted
		const errAmount = invalidFields['amountToSend']

		return (
			<div>
				<div> {t('WALLET_CURRENT_BALANCE_AVAILABLE', { args: ['DAI'] })} {walletBalanceDai} </div>
				<TextField
					fullWidth
					type='text'
					required
					label={t('TOKENS_TO_DEPOSIT', { args: ['DAI'] })}
					name='amountToSend'
					value={transaction.amountToSend || ''}
					onChange={(ev) => handleChange('amountToSend', ev.target.value)}
					onBlur={() => this.validateAmount(transaction.amountToSend, true)}
					onFocus={() => this.validateAmount(transaction.amountToSend, false)}
					error={errAmount && !!errAmount.dirty}
					helperText={errAmount && !!errAmount.dirty ?
						errAmount.errMsg : t('MAX_AMOUNT_TO_DEPOSIT', { args: [walletBalanceDai, 'DAI'] })
					}
				/>
			</div>
		)
	}
}

SendToIdentity.propTypes = {
	actions: PropTypes.object.isRequired,
	label: PropTypes.string,
	txId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	transaction: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
	// const persist = state.persist
	// const memory = state.memory

	const txId = props.stepsId
	return {
		txId: txId
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const SendToIdentityForm = NewTransactionHoc(SendToIdentityForm)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SendToIdentityForm)

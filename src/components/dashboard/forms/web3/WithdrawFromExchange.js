import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import TextField from '@material-ui/core/TextField'
import { validateNumber } from 'helpers/validators'

class WithdrawFromExchange extends Component {

	componentDidMount() {
		if (!this.props.transaction.withdrawAmount) {
			this.props.validate('withdrawAmount', {
				isValid: false,
				err: { msg: 'ERR_REQUIRED_FIELD' },
				dirty: false
			})
		}
	}

    validateAmount = (numStr, dirty) => {
    	let isValid = validateNumber(numStr)
    	let msg = 'ERR_INVALID_AMOUNT_VALUE'
    	let errMsgArgs = []
    	if (isValid && (parseFloat(numStr) > parseFloat(this.props.exchangeAvailable))) {
    		isValid = false
    		msg = 'ERR_MAX_AMOUNT_TO_WITHDRAW'
    		errMsgArgs = [this.props.exchangeAvailable, 'ADX']
    	}

    	this.props.validate('withdrawAmount', { isValid: isValid, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
    }

    render() {
    	const { transaction, t, invalidFields, exchangeAvailable, handleChange } = this.props
    	const errAmount = invalidFields['withdrawAmount']

    	return (
    		<div>
    			<div> {t('EXCHANGE_CURRENT_ADX_BALANCE_AVAILABLE')} {exchangeAvailable} </div>
    			<TextField
    				type='text'
    				fullWidth
    				required
    				label={t('TOKENS_TO_WITHDRAW')}
    				name='withdrawAmount'
    				value={transaction.withdrawAmount || ''}
    				onChange={(ev) => handleChange('withdrawAmount', ev.target.value)}
    				onBlur={() => this.validateAmount(transaction.withdrawAmount, true)}
    				onFocus={() => this.validateAmount(transaction.withdrawAmount, false)}
    				error={errAmount && !!errAmount.dirty}
    				helperText={errAmount && !!errAmount.dirty ?
    					errAmount.errMsg : t('MAX_AMOUNT_TO_WITHDRAW', { args: [exchangeAvailable, 'ADX'] })
    				}
    			/>
    		</div>
    	)
    }
}

WithdrawFromExchange.propTypes = {
	actions: PropTypes.object.isRequired,
	label: PropTypes.string,
	trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	transaction: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
	// const persist = state.persist
	// const memory = state.memory
	const trId = props.stepsId
	return {
		trId: trId
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const WithdrawFromExchangeForm = NewTransactionHoc(WithdrawFromExchange)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(WithdrawFromExchangeForm)

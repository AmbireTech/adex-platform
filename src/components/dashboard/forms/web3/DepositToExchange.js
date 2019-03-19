import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import TextField from '@material-ui/core/TextField'
import { validateNumber } from 'helpers/validators'

class DepositToExchange extends Component {

	componentDidMount() {
		if (!this.props.transaction.depositAmount) {
			this.props.validate('depositAmount', {
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
    	if (isValid && (parseFloat(numStr) > parseFloat(this.props.addrBalanceAdx))) {
    		isValid = false
    		msg = 'ERR_MAX_AMOUNT_TO_DEPOSIT'
    		errMsgArgs = [this.props.addrBalanceAdx, 'ADX']
    	}

    	this.props.validate('depositAmount', { isValid: isValid, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
    }

    render() {
    	const { transaction, t, invalidFields, addrBalanceAdx, handleChange } = this.props
    	const errAmount = invalidFields['depositAmount']

    	return (
    		<div>
    			<div> {t('ACCOUNT_CURRENT_ADX_BALANCE_AVAILABLE')} {addrBalanceAdx} </div>
    			<TextField
    				fullWidth
    				type='text'
    				required
    				label={t('TOKENS_TO_DEPOSIT')}
    				name='depositAmount'
    				value={transaction.depositAmount || ''}
    				onChange={(ev) => handleChange('depositAmount', ev.target.value)}
    				onBlur={() => this.validateAmount(transaction.depositAmount, true)}
    				onFocus={() => this.validateAmount(transaction.depositAmount, false)}
    				error={errAmount && !!errAmount.dirty}
    				helperText={errAmount && !!errAmount.dirty ?
    					errAmount.errMsg : t('MAX_AMOUNT_TO_DEPOSIT', { args: [addrBalanceAdx, 'ADX'] })
    				}
    			/>
    		</div>
    	)
    }
}

DepositToExchange.propTypes = {
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

const DepositToExchangeForm = NewTransactionHoc(DepositToExchange)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(DepositToExchangeForm)

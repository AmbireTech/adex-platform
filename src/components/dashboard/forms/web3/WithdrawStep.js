import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import TextField from '@material-ui/core/TextField'
import { validateNumber } from 'helpers/validators'
class WithdrawEthStep extends Component {
	componentDidMount() {
		if (!this.props.transaction.withdrawTo) {
			this.props.validate('withdrawTo', {
				isValid: false,
				err: { msg: 'ERR_REQUIRED_FIELD' },
				dirty: false
			})
		}
		if (!this.props.transaction.amountToWithdraw) {
			this.props.validate('amountToWithdraw', {
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
    	if (isValid && (parseFloat(numStr) > parseFloat(this.props.availableAmount))) {
    		isValid = false
    		msg = 'ERR_MAX_AMOUNT_TO_WITHDRAW'
    		errMsgArgs = [this.props.availableAmount, this.props.tokenName]
    	}

    	this.props.validate('amountToWithdraw', { isValid: isValid, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
    }

    validateAddress = (addr, dirty) => {
    	// TODO: ethers
    	let isValid = true // web3Utils.isAddress(addr)
    	let msg = 'ERR_INVALID_ETH_ADDRESS'
    	if (isValid && (addr.toLowerCase() === this.props.accAddr.toLowerCase())) {
    		isValid = false
    		msg = 'ERR_WITHDRAW_TO_YOUR_ADDR_IF_YOU_WANT_WITHDRAW'
    	}

    	this.props.validate('withdrawTo', { isValid: isValid, err: { msg: msg }, dirty: dirty })
    }

    render() {
    	const { transaction, t, invalidFields, handleChange, availableAmount, tokenName } = this.props
    	const errAmount = invalidFields['amountToWithdraw']
    	const errAddr = invalidFields['withdrawTo']

    	return (
    		<div>
    			<TextField
    				type='text'
    				required
    				fullWidth
    				label={t('WITHDRAW_TO')}
    				name='withdrawTo'
    				value={transaction.withdrawTo || ''}
    				onChange={(ev) => handleChange('withdrawTo', ev.target.value)}
    				onBlur={() => this.validateAddress(transaction.withdrawTo, true)}
    				onFocus={() => this.validateAddress(transaction.withdrawTo, false)}
    				error={errAddr && !!errAddr.dirty}
    				helperText={errAddr && !!errAddr.dirty ? errAddr.errMsg : ''}
    			/>
    			<TextField
    				type='text'
    				required
    				fullWidth
    				label={t('WITHDRAW_AMOUNT')}
    				name='amountToWithdraw'
    				value={transaction.amountToWithdraw || ''}
    				onChange={(ev) => handleChange('amountToWithdraw', ev.target.value)}
    				onBlur={() => this.validateAmount(transaction.amountToWithdraw, true)}
    				onFocus={() => this.validateAmount(transaction.amountToWithdraw, false)}
    				error={errAmount && !!errAmount.dirty}
    				helperText={errAmount && !!errAmount.dirty ?
    					errAmount.errMsg : t('MAX_AMOUNT_TO_WITHDRAW', { args: [availableAmount, tokenName] })
    				}
    			/>
    		</div>
    	)
    }
}

WithdrawEthStep.propTypes = {
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

const WithdrawEthStepForm = NewTransactionHoc(WithdrawEthStep)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(WithdrawEthStepForm)

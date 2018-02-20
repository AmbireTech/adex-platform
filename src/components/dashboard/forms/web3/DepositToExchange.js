import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import theme from 'components/dashboard/forms/theme.css'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import Input from 'react-toolbox/lib/input'
import { validateNumber } from 'helpers/validators'

class DepositToExchange extends Component {

    componentDidMount() {
        if (!this.props.transaction.withdrawAmount) {
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
        let tr = this.props.transaction
        let t = this.props.t
        let errAmount = this.props.invalidFields['depositAmount']

        return (
            <div>
                <span> {t('ACCOUNT_CURRENT_ADX_BALANCE_AVAILABLE')} {this.props.addrBalanceAdx} </span>
                <Input
                    type='text'
                    required
                    label={this.props.t('TOKENS_TO_DEPOSIT')}
                    name='depositAmount'
                    value={tr.depositAmount || ''}
                    onChange={(value) => this.props.handleChange('depositAmount', value)}
                    onBlur={this.validateAmount.bind(this, tr.depositAmount, true)}
                    onFocus={this.validateAmount.bind(this, tr.depositAmount, false)}
                    error={errAmount && !!errAmount.dirty ?
                        <span> {errAmount.errMsg} </span> : null}
                >
                    {errAmount && !errAmount.dirty ?
                        <div>
                            {t('MAX_AMOUNT_TO_DEPOSIT', { args: [this.props.addrBalanceAdx, 'ADX'] })}
                        </div> : null}
                </Input>
            </div>
        )
    }
}

DepositToExchange.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
        // trId: 'approve'
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

let DepositToExchangeForm = NewTransactionHoc(DepositToExchange)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DepositToExchangeForm)

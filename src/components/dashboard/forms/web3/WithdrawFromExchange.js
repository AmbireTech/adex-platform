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
        let tr = this.props.transaction
        let t = this.props.t
        let errAmount = this.props.invalidFields['withdrawAmount']

        return (
            <div>
                <span> {t('EXCHANGE_CURRENT_ADX_BALANCE_AVAILABLE')} {this.props.exchangeAvailable} </span>
                <Input
                    type='text'
                    required
                    label={this.props.t('TOKENS_TO_WITHDRAW')}
                    name='withdrawAmount'
                    value={tr.withdrawAmount || ''}
                    onChange={(value) => this.props.handleChange('withdrawAmount', value)}
                    onBlur={this.validateAmount.bind(this, tr.withdrawAmount, true)}
                    onFocus={this.validateAmount.bind(this, tr.withdrawAmount, false)}
                    error={errAmount && !!errAmount.dirty ?
                        <span> {errAmount.errMsg} </span> : null}
                >
                    {errAmount && !errAmount.dirty ?
                        <div>
                            {t('MAX_AMOUNT_TO_WITHDRAW', { args: [this.props.exchangeAvailable, 'ADX'] })}
                        </div> : null}
                </Input>
            </div>
        )
    }
}

WithdrawFromExchange.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    // let persist = state.persist
    // let memory = state.memory
    return {
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

let WithdrawFromExchangeForm = NewTransactionHoc(WithdrawFromExchange)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WithdrawFromExchangeForm)

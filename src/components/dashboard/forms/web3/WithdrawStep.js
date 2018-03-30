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
import { web3Utils } from 'services/smart-contracts/ADX'

class WithdrawEthStep extends Component {
    componentDidMount() {
        if (!this.props.transaction.withdrawAmount) {
            this.props.validate('withdrawTo', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
        if (!this.props.transaction.withdrawAmount) {
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
        let isValid = web3Utils.isAddress(addr)
        let msg = 'ERR_INVALID_ETH_ADDRESS'
        if (isValid && (addr.toLowerCase() === this.props.accAddr.toLowerCase())) {
            isValid = false
            msg = 'ERR_WITHDRAW_TO_YOUR_ADDR_IF_YOU_WANT_WITHDRAW'
        }

        this.props.validate('withdrawTo', { isValid: isValid, err: { msg: msg }, dirty: dirty })
    }

    render() {
        let tr = this.props.transaction
        let t = this.props.t
        let errAmount = this.props.invalidFields['amountToWithdraw']
        let errAddr = this.props.invalidFields['withdrawTo']

        return (
            <div>
                <Input
                    type='text'
                    required
                    label={this.props.t('WITHDRAW_TO')}
                    name='withdrawTo'
                    value={tr.withdrawTo || ''}
                    onChange={(value) => this.props.handleChange('withdrawTo', value)}
                    onBlur={this.validateAddress.bind(this, tr.withdrawTo, true)}
                    onFocus={this.validateAddress.bind(this, tr.withdrawTo, false)}
                    error={errAddr && !!errAddr.dirty ?
                        <span> {errAddr.errMsg} </span> : null}
                />
                <Input
                    type='text'
                    required
                    label={this.props.t('WITHDRAW_AMOUNT')}
                    name='amountToWithdraw'
                    value={tr.amountToWithdraw || ''}
                    onChange={(value) => this.props.handleChange('amountToWithdraw', value)}
                    onBlur={this.validateAmount.bind(this, tr.amountToWithdraw, true)}
                    onFocus={this.validateAmount.bind(this, tr.amountToWithdraw, false)}
                    error={errAmount && !!errAmount.dirty ?
                        <span> {errAmount.errMsg} </span> : null}
                >
                    {errAmount && !errAmount.dirty ?
                        <div>
                            {t('MAX_AMOUNT_TO_WITHDRAW', { args: [this.props.availableAmount, this.props.tokenName] })}
                        </div> : null}
                </Input>
            </div>
        )
    }
}

WithdrawEthStep.propTypes = {
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

let WithdrawEthStepForm = NewTransactionHoc(WithdrawEthStep)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WithdrawEthStepForm)

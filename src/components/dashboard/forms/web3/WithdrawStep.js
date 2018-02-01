import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import theme from 'components/dashboard/forms/theme.css'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
// import { Grid, Row, Col } from 'react-flexbox-grid'
// import numeral from 'numeral'
import Input from 'react-toolbox/lib/input'
// import { Button, IconButton } from 'react-toolbox/lib/button'

class WithdrawEthStep extends Component {
    estimateGas() {
        this.props.actions.updateSpinner(this.props.trId, true)
        this.props.estimateGasFn({
            _addr: this.props.account._addr,
            withdrawTo: this.props.transaction.withdrawTo,
            amountToWithdraw: this.props.transaction.amountToWithdraw,
            prKey: this.props.account._temp.privateKey
        })
            .then((res) => {
                this.props.actions.updateNewTransaction({ trId: this.props.trId, key: 'gas', value: res })
                this.props.actions.updateSpinner(this.props.trId, false)
            })
        // TODO: catch
    }

    componentWillUnmount() {
        //TODO: only on continue and validate inputs
        let tr = this.props.transaction
        if (tr.withdrawTo && tr.amountToWithdraw) {
            this.estimateGas()
        }
    }

    render() {
        let tr = this.props.transaction
        let t = this.props.t

        return (
            <div>
                <Input
                    type='text'
                    required
                    label={this.props.t('WITHDRAW_TO')}
                    name='withdrawTo'
                    value={tr.withdrawTo || ''}
                    onChange={(value) => this.props.handleChange('withdrawTo', value)}
                />
                <Input
                    type='text'
                    required
                    label={this.props.t('WITHDRAW_AMOUNT')}
                    name='amountToWithdraw'
                    value={tr.amountToWithdraw || ''}
                    onChange={(value) => this.props.handleChange('amountToWithdraw', value)}
                />
            </div>
        )
    }
}

WithdrawEthStep.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    estimateGasFn: PropTypes.func.isRequired
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

let WithdrawEthStepForm = NewTransactionHoc(WithdrawEthStep)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WithdrawEthStepForm)

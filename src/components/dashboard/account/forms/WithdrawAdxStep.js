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

import scActions from 'services/smart-contracts/actions'
const { withdrawAdxEstimateGas } = scActions

//TODO: refactor to esc ape code duplication
class WithdrawAdxStep extends Component {
    estimateGas() {
        this.props.actions.updateSpinner(this.props.trId, true)
        withdrawAdxEstimateGas({
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
        this.estimateGas()
    }

    render() {
        let tr = this.props.transaction
        let t = this.props.t

        return (
            <div>
                <Input
                    type='text'
                    required
                    label={this.props.t('WITHDRAW_ADX_TO')}
                    name='name'
                    value={tr.withdrawTo || ''}
                    onChange={(value) => this.props.handleChange('withdrawTo', value)}
                />
                <Input
                    type='number'
                    required
                    label={this.props.t('WITHDRAW_ADX_AMOUNT')}
                    name='name'
                    value={tr.amountToWithdraw || 0}
                    onChange={(value) => this.props.handleChange('amountToWithdraw', value)}
                />
            </div>
        )
    }
}

WithdrawAdxStep.propTypes = {
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

let WithdrawAdxStepForm = NewTransactionHoc(WithdrawAdxStep)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(WithdrawAdxStepForm)

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './../theme.css'
import NewTransactionHoc from './TransactionHoc'
import { Grid, Row, Col } from 'react-flexbox-grid'
import Tooltip from 'react-toolbox/lib/tooltip'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import { DEFAULT_GAS_PRICE } from 'services/smart-contracts/constants'
import { web3Utils } from 'services/smart-contracts/ADX'
import { FontIcon } from 'react-toolbox/lib/font_icon'
import classnames from 'classnames'
import GasPrice from 'components/dashboard/account/GasPrice'
import { PropRow } from 'components/dashboard/forms/FormsCommon'
import Helper from 'helpers/miscHelpers'

const TooltipCol = Tooltip(Col)

class TransactionPreview extends Component {

    constructor(props, context) {
        super(props, context)

        this.state = {
            gas: null,
            errors: []
        }
    }

    componentWillMount() {
        if (this.props.estimateGasFn && Object.keys(this.props.transaction).length) {

            this.props.actions.updateSpinner(this.props.trId, true)
            this.props.estimateGasFn({ acc: this.props.account, transaction: this.props.transaction })
                .then((estimatedGas) => {
                    this.setState({ gas: estimatedGas })
                    this.props.handleChange('gas', estimatedGas)
                    this.props.actions.updateSpinner(this.props.trId, false)
                })
                .catch((err) => {
                    console.log(err)
                    this.props.actions.updateSpinner(this.props.trId, false)
                    this.props.handleChange('errors', [Helper.getErrMsg(err)])
                })
        }
    }

    gasRow = ({ gas, gasPrice }) => {
        let eGas = gas.gas ? gas.gas : gas
        let fee = web3Utils.fromWei((eGas * parseInt(gasPrice, 10)).toString(), 'ether')
        return (
            <PropRow
                left={
                    <TooltipCol className={'theme.textRight'} tooltip={this.props.t('OPERATION_FEE_TOOLTIP')} >
                        <strong>{this.props.t(gas.trMethod || 'OPERATION_FEE')}</strong>
                    </TooltipCol>
                }
                right={<strong>{fee} ETH</strong>}
            />
        )
    }

    gasInfo = ({ gasPrice }) => {
        if (!this.state.gas) return null

        if (Array.isArray(this.state.gas)) {
            return (
                <div>
                    {this.state.gas.map((gas, index) =>
                        <this.gasRow key={index} gas={gas} gasPrice={gasPrice} />
                    )}
                </div>
            )
        } else {
            return (<this.gasRow gas={this.state.gas} gasPrice={gasPrice} />)
        }
    }

    render() {
        const transaction = this.props.transaction || {}
        const t = this.props.t
        const gasPrice = this.props.account._settings.gasPrice ? this.props.account._settings.gasPrice : DEFAULT_GAS_PRICE
        const previewWarnMsgs = this.props.previewWarnMsgs
        const errors = transaction.errors || []

        return (
            <div>
                {this.props.spinner ?
                    <ProgressBar className={theme.progressCircleCenter} type='circular' mode='indeterminate' multicolor />
                    :

                    <Grid fluid>
                        {errors.length ?
                            errors.map((err, index) =>
                                <PropRow
                                    key={index}
                                    className={theme.error}
                                    left={<span> <FontIcon value='error' /> </span>}
                                    right={err}
                                />)
                            : null}


                        {previewWarnMsgs ?
                            previewWarnMsgs.map((msg, index) =>
                                <PropRow
                                    key={index}
                                    className={theme.warning}
                                    left={<span> <FontIcon value='warning' /> </span>}
                                    right={t(msg.msg, { args: msg.args })}
                                />
                            )
                            : null}

                        {!errors.length ?
                            <PropRow
                                right={<GasPrice />}
                            /> : null}

                        <this.gasInfo gasPrice={gasPrice} />

                        {
                            Object
                                .keys(transaction)
                                .filter((key) => !/gas|account/.test(key))
                                .map(key => {
                                    let keyName = key
                                    let value = transaction[key]
                                    let isObjValue = (typeof value === 'object')
                                    if (isObjValue) {
                                        value = JSON.stringify(value, null, 2)
                                    }

                                    return (
                                        <PropRow
                                            key={key}
                                            left={this.props.t(keyName, { isProp: true })}
                                            right={isObjValue ?
                                                <pre>
                                                    {(value || '').toString()}
                                                </pre>
                                                :
                                                (value || '').toString()
                                            }
                                        />
                                    )
                                })
                        }
                    </Grid>
                }

            </div>
        )
    }
}

TransactionPreview.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    previewMsgs: PropTypes.array,
    estimateGasFn: PropTypes.func
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
        transaction: memory.newTransactions[props.trId] || {},
        trId: props.trId,
        spinner: memory.spinners[props.trId],
        account: persist.account
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

let TransactionPreviewForm = NewTransactionHoc(TransactionPreview)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TransactionPreviewForm)

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
        if (this.props.estimateGasFn) {
            
            this.props.actions.updateSpinner(this.props.trId, true)
            this.props.estimateGasFn({acc: this.props.account, transaction: this.props.transaction})
                .then((estimatedGas) => {
                    this.setState({gas: estimatedGas })
                    this.props.handleChange('gas', estimatedGas)
                    this.props.actions.updateSpinner(this.props.trId, false)
                })
        }
    }

    gasRow = ({gas, gasPrice}) => {
        let eGas = gas.gas ? gas.gas : gas
        console.log('eGas', eGas)
        console.log('gasPrice', gasPrice)
        let fee = web3Utils.fromWei((eGas * parseInt(gasPrice, 10)).toString(), 'ether')
        return (
            <Row>
                <TooltipCol xs={12} lg={4} className={'theme.textRight'}
                    tooltip={this.props.t('OPERATION_FEE_TOOLTIP')}
                >
                    <strong>  {this.props.t(gas.trMethod || 'OPERATION_FEE')}:</strong>
                </TooltipCol>
                <Col xs={12} lg={8} className={'theme.textLeft'}><strong>{fee} ETH</strong></Col>
            </Row>
        )

    } 

    gasInfo = ({gasPrice}) => {
        if(!this.state.gas) return null

        if(Array.isArray(this.state.gas)) {
            return(
                <div>
                    {this.state.gas.map((gas, index) => 
                        <this.gasRow key={index} gas={gas} gasPrice={gasPrice} />
                    )}
                </div>         
            )
        } else {
            return ( <this.gasRow  gas={this.state.gas} gasPrice={gasPrice} /> )
        }
    }

    render() {
        let transaction = this.props.transaction || {}
        let t = this.props.t
        const gasPrice = this.props.account._settings.gasPrice ? this.props.account._settings.gasPrice : DEFAULT_GAS_PRICE
        let previewWarnMsgs = this.props.previewWarnMsgs

        return (
            <div>
                {this.props.spinner ?
                    <ProgressBar type='circular' mode='indeterminate' multicolor />
                    :

                    <Grid fluid>
                        <Row >
                            <Col xs={12} lg={4} className={classnames(theme.textRight, theme.warning)}></Col>
                            <Col xs={12} lg={8} className={classnames(theme.textLeft)}>
                                <GasPrice />
                            </Col>
                        </Row>
                        {previewWarnMsgs ?
                            previewWarnMsgs.map((msg, index) =>
                                <Row key={index}>
                                    <Col xs={12} lg={4} className={classnames(theme.textRight, theme.warning)}><span> <FontIcon value='warning' /> </span> <span>:</span></Col>
                                    <Col xs={12} lg={8} className={classnames(theme.textLeft, theme.warning)}>
                                        {t(msg.msg, { args: msg.args })}
                                    </Col>
                                </Row>
                            )
                            : null}
                        
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
                                        <Row key={key}>
                                            <Col xs={12} lg={4} className={theme.textRight}>{this.props.t(keyName, { isProp: true })}:</Col>
                                            <Col xs={12} lg={8} className={theme.textLeft}>
                                                {isObjValue ?
                                                    <pre>
                                                        {(value || '').toString()}
                                                    </pre>
                                                    :
                                                    (value || '').toString()
                                                }
                                            </Col>
                                        </Row>
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

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

const TooltipCol = Tooltip(Col)

class TransactionPreview extends Component {

    constructor(props, context) {
        super(props, context)

        this.state = {
            gas: 0
        }
    }

    render() {
        let transaction = this.props.transaction || {}
        // let t = this.props.t
        let fee
        let gasPrice = this.props.account._settings.gasPrice ? this.props.account._settings.gasPrice : DEFAULT_GAS_PRICE
        let previewMsgs = this.props.previewMsgs

        if (transaction.gas) {
            fee = web3Utils.fromWei((transaction.gas * gasPrice).toString(), 'ether')
        }

        return (
            <div>
                {this.props.spinner ?
                    <ProgressBar type='circular' mode='indeterminate' multicolor />
                    :

                    <Grid fluid>
                        {
                            Object
                                .keys(transaction)
                                .filter((key) => !/gas|account/.test(key))
                                .map(key => {
                                    let keyName = key
                                    let value = transaction[key]
                                    let isObjValue = (typeof value === 'object')
                                    if(isObjValue){
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
                        {previewMsgs ?
                            previewMsgs.map((msg, index) =>
                                <h2 key={index}> {msg} </h2>
                            )
                            : null}
                        {!!fee ?
                            <Row>
                                <TooltipCol xs={12} lg={4} className={'theme.textRight'}
                                    tooltip={this.props.t('OPERATION_FEE_TOOLTIP')}
                                >
                                    <strong>  {this.props.t('OPERATION_FEE *', { isProp: true })}:</strong>
                                </TooltipCol>
                                <Col xs={12} lg={8} className={'theme.textLeft'}><strong>{fee} ETH</strong></Col>
                            </Row>
                            : null}
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
    previewMsgs: PropTypes.array
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

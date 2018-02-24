import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Grid, Row, Col } from 'react-flexbox-grid'
// import theme from 'components/dashboard/forms/theme.css'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
// import { Grid, Row, Col } from 'react-flexbox-grid'
// import numeral from 'numeral'
import Input from 'react-toolbox/lib/input'
import ProgressBar from 'react-toolbox/lib/progress_bar'
// import { Button, IconButton } from 'react-toolbox/lib/button'
import { getBidVerificationReport } from 'services/adex-node/actions'

class VerifyBid extends Component {
    componentWillMount() {
        this.props.actions.updateSpinner(this.props.placedBid._id, true)

        getBidVerificationReport({ bidId: this.props.placedBid._id, authSig: this.props.account._authSig })
            .then((report) => {
                //TODO: Spinner and validation before report ready
                this.props.handleChange('placedBid', this.props.placedBid)
                this.props.handleChange('account', this.props.acc)
                this.props.handleChange('report', report.ipfs)
                this.props.actions.updateSpinner(this.props.placedBid._id, false)
            })
    }

    row = ({ left, right }) =>
        <Row >
            <Col xs={12} lg={4} className={'theme.textRight'}>{left}:</Col>
            <Col xs={12} lg={8} className={'theme.textLeft'}>{right}</Col>
        </Row>

    render() {
        let tr = this.props.transaction
        let t = this.props.t
        let unit = tr.unit || {}
        let unitMeta = unit._meta || {}
        let bid = this.props.placedBid || {}

        console.log('unitMeta', unitMeta)

        return (
            <div>
                <Grid fluid>
                    <this.row left={this.props.t('BID_CLICKS')} right={bid._target} />
                    <this.row left={this.props.t('BID_AMOUNT')} right={bid._amount} />
                    <this.row left={this.props.t('BID_TIMEOUT')} right={bid._timeout} />

                    {!!this.props.spinner ?
                        <ProgressBar type='circular' mode='indeterminate' multicolor />
                        :
                        <this.row left={this.props.t('REPORT')} right={tr.report} />
                    }

                </Grid>
            </div>
        )
    }
}

VerifyBid.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    placedBid: PropTypes.object.isRequired,
    spinner: PropTypes.bool,
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
        spinner: memory.spinners[props.placedBid._id],
        // trId: 'approve'
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

let VerifyBidForm = NewTransactionHoc(VerifyBid)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VerifyBidForm)

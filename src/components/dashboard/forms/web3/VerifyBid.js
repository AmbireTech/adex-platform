import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Grid, Row, Col } from 'react-flexbox-grid'
import theme from './../theme.css'
import NewTransactionHoc from './TransactionHoc'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import { BidInfo } from './BidsCommon'
import { getBidVerificationReport } from 'services/adex-node/actions'

class VerifyBid extends Component {
    componentWillMount() {
        if (!this.props.transaction.report) {

            this.props.validate('report', { isValid: false,  err: { msg: 'ERR_UNIT_INFO_NOT_READY' },  dirty: false })
            this.props.actions.updateSpinner(this.props.trId, true)

            getBidVerificationReport({ bidId: this.props.placedBid._id, authSig: this.props.account._authSig })
                .then((report) => {
                    //TODO: Spinner and validation before report ready
                    this.props.handleChange('placedBid', this.props.placedBid)
                    this.props.handleChange('account', this.props.acc)
                    this.props.handleChange('report', report)
                    this.props.actions.updateSpinner(this.props.trId, false)
                    this.props.validate('report', { isValid: true,  dirty: false })
                })
                .catch((err)=> {
                    this.props.actions
                        .addToast({ type: 'warning', action: 'X', label: this.props.t('ERR_GETTING_BID_REPORT', {args: [err]} ), timeout: 5000 })
                })
        }
    }

    render() {
        let tr = this.props.transaction
        let t = this.props.t
        let bid = this.props.placedBid || {}

        return (
            <div>
                {!!this.props.spinner ?
                    <ProgressBar className={theme.progressCircleCenter} type='circular' mode='indeterminate' multicolor />
                    :
                    <Grid fluid>
                        <BidInfo bid={bid} t={t} report={tr.report} />
                    </Grid>
                }
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
        spinner: memory.spinners[props.trId],
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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Grid } from 'react-flexbox-grid'
import theme from './../theme.css'
import NewTransactionHoc from './TransactionHoc'
import { getItem } from 'services/adex-node/actions'
import { BidInfo } from './BidsCommon'
import ProgressBar from 'react-toolbox/lib/progress_bar'


class CancelBid extends Component {
    // TODO: pas unit as prop are make hoc for this and accept bid
    componentWillMount() {
        if (!this.props.transaction.unit) {

            this.props.validate('unit', { isValid: false, err: { msg: 'ERR_UNIT_INFO_NOT_READY' }, dirty: false })
            this.props.actions.updateSpinner(this.props.trId, true)

            getItem({ id: this.props.adUnitId, authSig: this.props.account._authSig })
                .then((unit) => {
                    this.props.handleChange('unit', unit)
                    this.props.handleChange('placedBid', this.props.placedBid)
                    this.props.handleChange('account', this.props.acc)
                    this.props.actions.updateSpinner(this.props.trId, false)
                    this.props.validate('unit', { isValid: true, dirty: false })
                })
                .catch((err) => {
                    this.props.actions
                        .addToast({ type: 'warning', action: 'X', label: this.props.t('ERR_GETTING_BID_INFO', { args: [err] }), timeout: 5000 })
                })
        }
    }

    render() {
        let tr = this.props.transaction
        let t = this.props.t
        let unit = tr.unit
        let bid = this.props.placedBid || {}

        return (
            <div>
                {!!this.props.spinner ?
                    <ProgressBar className={theme.progressCircleCenter} type='circular' mode='indeterminate' multicolor />
                    :
                    <Grid fluid>
                        <BidInfo bid={bid} unit={unit} t={t} />
                    </Grid>
                }
            </div>
        )
    }
}

CancelBid.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    placedBid: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    // let persist = state.persist
    let memory = state.memory
    return {
        spinner: memory.spinners[props.trId]
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

let CancelBidForm = NewTransactionHoc(CancelBid)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CancelBidForm)

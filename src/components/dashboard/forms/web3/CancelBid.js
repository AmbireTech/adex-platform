import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewTransactionHoc from './TransactionHoc'
import { getItem } from 'services/adex-node/actions'
import { BidInfo } from './BidsCommon'
import CircularProgress from '@material-ui/core/CircularProgress'


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
        const { transaction, t, classes, placedBid = {} } = this.props

        const unit = transaction.unit

        return (
            <div>
                {!!this.props.spinner ?
                    <div className={classes.centralSpinner}>
                        <CircularProgress />
                    </div>
                    :
                    // <Grid fluid>
                    <BidInfo bid={placedBid} unit={unit} t={t} />
                    // </Grid>
                }
            </div>
        )
    }
}

CancelBid.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    placedBid: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    // let persist = state.persist
    const memory = state.memory
    const trId = props.stepsId
    return {
        trId: trId,
        spinner: memory.spinners[trId]
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const CancelBidForm = NewTransactionHoc(CancelBid)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CancelBidForm)

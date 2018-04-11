import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Grid } from 'react-flexbox-grid'
import theme from './../theme.css'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import { getItem } from 'services/adex-node/actions'
import { BidInfo } from './BidsCommon'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import scActions from 'services/smart-contracts/actions'

const { getAccountBalances } = scActions

class AcceptBid extends Component {
    constructor(props) {
        super(props)
        this.state = {
            errMsg: null,
            errArgs: []
        }
    }

    componentWillMount() {
        this.props.validate('unit', { isValid: false, err: { msg: 'ERR_UNIT_INFO_NOT_READY' }, dirty: false })
        this.props.actions.updateSpinner(this.props.trId, true)

        getAccountBalances(this.props.placedBid._advertiser)
            .then((balances) => {

                let available = parseInt(balances.available, 10)
                let bid = parseInt(this.props.placedBid._amount, 10)

                if ((available < bid)) {
                    this.setState({ errMsg: 'ERR_NO_ADV_AMOUNT_ON_EXCHANGE' })
                    this.props.validate('unit', { isValid: false, err: { msg: 'ERR_NO_ADV_AMOUNT_ON_EXCHANGE' }, dirty: false })
                } else if ((bid <= 0)) {
                    this.setState({ errMsg: 'ERR_INVALID_BID_AMOUNT' })
                    this.props.validate('unit', { isValid: false, err: { msg: 'ERR_INVALID_BID_AMOUNT' }, dirty: false })
                }

                return getItem({ id: this.props.adUnitId, authSig: this.props.account._authSig })
            })
            .then((unit) => {
                this.props.handleChange('unit', unit)
                this.props.handleChange('placedBid', this.props.placedBid)
                this.props.handleChange('slot', this.props.slot)
                this.props.handleChange('account', this.props.acc)
                this.props.actions.updateSpinner(this.props.trId, false)
                if (!this.state.errMsg) {
                    this.props.validate('unit', { isValid: true, dirty: false })
                }
            })
            .catch((err) => {
                this.props.actions.updateSpinner(this.props.trId, false)
                this.props.validate('unit', { isValid: false, dirty: false })
                this.setState({ errMsg: 'ERR_TRANSACTION', errArgs: [err] })
                this.props.actions
                    .addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_GETTING_BID_INFO', { args: [err] }), timeout: 5000 })
            })
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
                        <BidInfo
                            bid={bid}
                            unit={unit}
                            t={t}
                            errMsg={this.state.errMsg}
                            errArgs={this.state.errArgs}
                        />
                    </Grid>
                }
            </div>
        )
    }
}

AcceptBid.propTypes = {
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
        spinner: memory.spinners[trId],
        trId: trId
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const AcceptBidForm = NewTransactionHoc(AcceptBid)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AcceptBidForm)

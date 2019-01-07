import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import Grid from '@material-ui/core/Grid'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import { getItem } from 'services/adex-node/actions'
import { BidInfo } from './BidsCommon'
import CircularProgress from '@material-ui/core/CircularProgress'
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
        const { handleChange, validate, actions, placedBid, account } = this.props

        validate('unit', { isValid: false, err: { msg: 'ERR_UNIT_INFO_NOT_READY' }, dirty: false })
        actions.updateSpinner(this.props.trId, true)

        getAccountBalances({ addr: placedBid._advertiser, authType: account._authType })
            .then((balances) => {

                let available = parseInt(balances.available, 10)
                let bid = parseInt(placedBid._amount, 10)

                if ((available < bid)) {
                    this.setState({ errMsg: 'ERR_NO_ADV_AMOUNT_ON_EXCHANGE' })
                    validate('unit', { isValid: false, err: { msg: 'ERR_NO_ADV_AMOUNT_ON_EXCHANGE' }, dirty: false })
                } else if ((bid <= 0)) {
                    this.setState({ errMsg: 'ERR_INVALID_BID_AMOUNT' })
                    validate('unit', { isValid: false, err: { msg: 'ERR_INVALID_BID_AMOUNT' }, dirty: false })
                }

                return getItem({ id: this.props.adUnitId, authSig: this.props.account._authSig })
            })
            .then((unit) => {
                handleChange('unit', unit)
                handleChange('placedBid', placedBid)
                handleChange('slot', this.props.slot)
                handleChange('account', this.props.acc)
                actions.updateSpinner(this.props.trId, false)
                if (!this.state.errMsg) {
                    validate('unit', { isValid: true, dirty: false })
                }
            })
            .catch((err) => {
                actions.updateSpinner(this.props.trId, false)
                validate('unit', { isValid: false, dirty: false })
                this.setState({ errMsg: 'ERR_TRANSACTION', errArgs: [err] })
                actions
                    .addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_GETTING_BID_INFO', { args: [err] }), timeout: 5000 })
            })
    }

    render() {
        const { t, classes, transaction, placedBid = {} } = this.props
        const unit = transaction.unit

        return (
            <div>
                {!!this.props.spinner ?
                    <div className={classes.centralSpinner}>
                        <CircularProgress />
                    </div>
                    :
                    // <Grid fluid>
                    <BidInfo
                        bid={placedBid}
                        unit={unit}
                        t={t}
                        errMsg={this.state.errMsg}
                        errArgs={this.state.errArgs}
                    />
                    // </Grid>
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

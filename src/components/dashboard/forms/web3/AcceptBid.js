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

const { getAccountExchangeAmount } = scActions

class AcceptBid extends Component {
    constructor(props) {
        super(props)
        this.state = {
            errMsg: null,
            errArgs: []
        }
    } 

    componentWillMount() {
        if (!this.props.transaction.unit) {
            this.props.validate('unit', { isValid: false, err: { msg: 'ERR_UNIT_INFO_NOT_READY' }, dirty: false })
            this.props.actions.updateSpinner(this.props.trId, true)

            getItem({ id: this.props.adUnitId, authSig: this.props.account._authSig })
                .then((unit) => {
                    this.props.handleChange('unit', unit)
                    this.props.handleChange('placedBid', this.props.placedBid)
                    this.props.handleChange('slot', this.props.slot)
                    this.props.handleChange('account', this.props.acc)         

                    return getAccountExchangeAmount(this.props.placedBid._advertiser)
                })
                .then((advertiserAdxOnExchange) => {
                    this.props.actions.updateSpinner(this.props.trId, false)
                    let available = parseInt(advertiserAdxOnExchange.availabl, 10)
                    let bid = parseInt(this.props.placedBid._amount, 10)

                    // TODO: new err msg for 0 bid; validate place bid > 0
                    if((available >=  bid) &&  (bid > 0)) {                        
                        this.props.validate('unit', { isValid: true, dirty: false })
                    } else {
                        // TODO: check why set state after unmounth
                        this.setState({errMsg: 'ERR_NO_ADV_AMOUNT_ON_EXCHANGE'})
                    } 
                })
                .catch((err) => {
                    this.props.validate('unit', { isValid: true, dirty: false })
                    this.setState({errMsg: 'ERR_TRANSACTION', errArgs: [err]})
                    this.props.actions
                        .addToast({ type: 'warning', action: 'X', label: this.props.t('ERR_GETTING_BID_INFO', { args: [err] }), timeout: 5000 })
                })
        }
    }

    componentWillUnmount() {
        this.props.resetTransaction()
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

let AcceptBidForm = NewTransactionHoc(AcceptBid)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AcceptBidForm)

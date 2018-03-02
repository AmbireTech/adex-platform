import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './../theme.css'
import Input from 'react-toolbox/lib/input'
import { Bid } from 'adex-models'
// import ValidItemHoc from './ValidItemHoc'
import NewBidHoc from './NewBidHoc'
import numeral from 'numeral'
import Dropdown from 'react-toolbox/lib/dropdown'
import constants from 'adex-constants'
import { validAmountStr, adxToFloatView, adxAmountStrToPrecision } from 'services/smart-contracts/utils'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import { Grid } from 'react-flexbox-grid'
import scActions from 'services/smart-contracts/actions'

const { getAccountBalances } = scActions

const SPINNER_ID = 'place-bid'

class BidForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      exchangeAvailable: '0'
    }
  }

  componentWillMount() {
    this.props.actions.updateSpinner(SPINNER_ID, true)

    if (!this.props.bid.target) {
      this.props.validate('target', {
        isValid: false,
        err: { msg: 'ERR_REQUIRED_FIELD' },
        dirty: false
      })
    }
    if (!this.props.bid.amount) {
      this.props.validate('amount', {
        isValid: false,
        err: { msg: 'ERR_REQUIRED_FIELD' },
        dirty: false
      })
    }
    if (!this.props.bid.timeout) {
      this.props.validate('timeout', {
        isValid: false,
        err: { msg: 'ERR_REQUIRED_FIELD' },
        dirty: false
      })
    }

    getAccountBalances(this.props.account._addr)
      .then((balances) => {
        this.props.actions.updateSpinner(SPINNER_ID, false)
        this.setState({ exchangeAvailable: balances.available })
      })
      .catch((err) => {
        this.props.actions.updateSpinner(SPINNER_ID, false)
        this.props.actions
          .addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_GETTING_BALANCES_INFO', { args: [err] }), timeout: 5000 })
      })
  }

  validateAndUpdateDD = (dirty, propsName, value) => {
    let isValid = !!value
    let msg = 'ERR_REQUIRED_FIELD'

    this.props.handleChange(propsName, value)
    this.props.validate(propsName, { isValid: isValid, err: { msg: msg }, dirty: dirty })
  }

  isValidTarget = (target) => {
    return /^\+?(0|[1-9]\d*)$/.test(target)
  }

  validateAmount = (amount, dirty, exchangeAvailable) => {
    let msg = ''
    let errMsgArgs = []
    let isValid = validAmountStr(amount)

    if (!isValid) {
      msg = 'ERR_INVALID_AMOUNT'
    } else if (parseInt(adxAmountStrToPrecision(amount), 10) <= 0) {
      msg = 'ERR_BID_ZERO_AMOUNT'
    } else if (parseInt(adxAmountStrToPrecision(amount || '0'), 10) > parseInt(exchangeAvailable || '0', 10)) {
      msg = 'ERR_ADV_NO_SUFFICIENT_DEPOSIT'
      errMsgArgs.push(adxToFloatView(exchangeAvailable))
    }

    this.props.validate('amount', { isValid: !msg, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
  }

  render() {
    let bid = this.props.bid || {}
    let t = this.props.t
    let timeout = bid.timeout || constants.exchange.TIMEOUTS[0]
    let timeouts = constants.exchange.TIMEOUTS.map((tmo) => {
      return { value: tmo.value + '', label: t(tmo.label, { args: tmo.labelArgs }) }
    })

    let errTarget = this.props.invalidFields['target']
    let errAmount = this.props.invalidFields['amount']
    let exchangeAvailable = this.state.exchangeAvailable

    return (
      <div>
        {!!this.props.spinner ?
          <ProgressBar className={theme.progressCircleCenter} type='circular' mode='indeterminate' multicolor />
          :
          <Grid fluid>
            <Input
              type='text'
              required
              label={t('BID_TARGET_CLICKS', { args: [numeral(bid.target).format('0')] })}
              name='target'
              step='1'
              value={bid.target || ''}
              onChange={(value) => this.props.handleChange('target', value)}
              onBlur={this.props.validate.bind(this, 'target', { isValid: this.isValidTarget(bid.target), err: { msg: 'ERR_INVALID_TARGET' }, dirty: true })}
              onFocus={this.props.validate.bind(this, 'target', { isValid: this.isValidTarget(bid.target), err: { msg: 'ERR_INVALID_TARGET' }, dirty: false })}
              error={errTarget && !!errTarget.dirty ? <span> {errTarget.errMsg} </span> : null}
            >

            </Input>
            <Input
              type='text'
              required
              label={t('BID_AMOUNT', { args: [numeral(bid.amount).format('ADX 0,0')] })}
              name='amount'
              value={bid.amount || ''}
              onChange={(value) => this.props.handleChange('amount', value)}
              onBlur={this.validateAmount.bind(this, bid.amount, true, exchangeAvailable)}
              onFocus={this.validateAmount.bind(this, bid.amount, false, exchangeAvailable)}
              error={errAmount && !!errAmount.dirty ? <span> {errAmount.errMsg} </span> : null}
            >
              {!errAmount || !errAmount.dirty ?
                <div> {t('EXCHANGE_ADX_BALANCE_AVAILABLE_BID_INFO', { args: [adxToFloatView(exchangeAvailable)] })} </div>
                : null}

            </Input>
            <Dropdown
              required
              onChange={this.validateAndUpdateDD.bind(this, true, 'timeout')}
              source={timeouts}
              value={timeout + ''}
              label={t('BID_TIMEOUT')}
            />
          </Grid>
        }
      </div>
    )
  }
}

BidForm.propTypes = {
  actions: PropTypes.object.isRequired,
  label: PropTypes.string,
  bid: PropTypes.object,
  bidId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  bidsIds: PropTypes.array
}

function mapStateToProps(state, props) {
  let persist = state.persist
  let memory = state.memory
  return {
    bid: memory.newBid[props.bidId] || new Bid().plainObj(),
    bidsIds: persist.bids.bidsIds,
    bidId: props.bidId,
    account: persist.account,
    spinner: memory.spinners[SPINNER_ID]
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

let NewBidForm = NewBidHoc(BidForm)
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewBidForm)

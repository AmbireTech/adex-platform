import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import theme from './theme.css'
import Input from 'react-toolbox/lib/input'
import { Bid } from 'adex-models'
// import ValidItemHoc from './ValidItemHoc'
import NewBidHoc from './NewBidHoc'
import numeral from 'numeral'
import Dropdown from 'react-toolbox/lib/dropdown'
import constants from 'adex-constants'
import { validAmountStr, adxToFloatView, adxAmountStrToPrecision } from 'services/smart-contracts/utils'

class BidForm extends Component {

    componentDidMount() {
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

  render() {
    let bid = this.props.bid || {}
    let t = this.props.t
    let timeout = bid.timeout || constants.exchange.TIMEOUTS[0]
    let timeouts = constants.exchange.TIMEOUTS.map((tmo) => {
      return { value: tmo.value + '', label: t(tmo.label, { args: tmo.labelArgs }) }
    })

    let errTarget = this.props.invalidFields['target']
    let errAmount = this.props.invalidFields['amount']

    let account = this.props.account
    let stats = { ...account._stats } || {}
    let exchBal = stats.exchangeBalance || {}
    let exchangeAvailable = adxToFloatView(exchBal.available)
    let bidAmount =  0 
    if(validAmountStr(bid.amount)) {
      bidAmount = adxToFloatView(adxAmountStrToPrecision(bid.amount))
    }    

    return (
      <div>
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
          onBlur={this.props.validate.bind(this, 'amount', { isValid: validAmountStr(bid.amount), err: { msg: 'ERR_INVALID_AMOUNT' }, dirty: true })}
          onFocus={this.props.validate.bind(this, 'amount', { isValid: validAmountStr(bid.amount), err: { msg: 'ERR_INVALID_AMOUNT' }, dirty: false })}
          error={errAmount && !!errAmount.dirty ? <span> {errAmount.errMsg} </span> : null}
        >
          {!errAmount || !errAmount.dirty ?
            <div>
                {exchangeAvailable >= bidAmount ? 
                  <span> {t('EXCHANGE_ADX_BALANCE_AVAILABLE') + ': ' +  exchangeAvailable} </span>
                  :
                  <span> {t('ERR_ADV_NO_SUFFICIENT_DEPOSIT')}</span>
                }
            </div> : null}

        </Input>
        <Dropdown
          required
          onChange={this.validateAndUpdateDD.bind(this, true, 'timeout')}
          source={timeouts}
          value={timeout + ''}
          label={t('BID_TIMEOUT')}
        />
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
    account: persist.account
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

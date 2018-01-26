import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Button, IconButton } from 'react-toolbox/lib/button'
import theme from './theme.css'
import Input from 'react-toolbox/lib/input'
import Bid from 'models/Bid'
import Translate from 'components/translate/Translate'
// import ValidItemHoc from './ValidItemHoc'
import NewBidHoc from './NewBidHoc'
import numeral from 'numeral'
import DatePicker from 'react-toolbox/lib/date_picker'
import moment from 'moment'

class BidForm extends Component {
  render() {
    let bid = this.props.bid || {}
    let t = this.props.t
    let timeout = bid.timeout ? new Date(bid.timeout) : null

    return (
      <div>
        <Input
          type='text'
          required
          label={t('BID_TARGET_CLICKS', { args: [numeral(bid.target).format('0')] })}
          name='target'
          step='1'
          value={bid.target}
          onChange={(value) => this.props.handleChange('target', value)}
        />
        <Input
          type='text'
          required
          label={t('BID_AMOUNT', { args: [numeral(bid.amount).format('ADX 0,0')] })}
          name='spaces'
          // step={}
          // max={}
          value={bid.amount}
          onChange={(value) => this.props.handleChange('amount', value)}
        />
        <DatePicker
          minDate={new Date()}
          onChange={(value) => this.props.handleChange('timeout', value)}
          value={timeout}
          className={theme.datepicker}
          theme={theme}
          inputFormat={this.inputFormat}
          label={t('BID_TIMEOUT')}
          size={moment(timeout).format('MMMM').length} /** temp fix */
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
    bidId: props.bidId
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

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

const EJ_MAX_SPACES = 2000000
const SPACES_COUNT_STEP = 10000
const MIN_BID_PRICE = 0.05

class BidForm extends Component {
  render() {
    let bid = this.props.bid || {}
    let t = this.props.t

    return (
      <div>
        <Input
          type='number'
          required
          label={t('BIDS_PER_SPACE', { args: [numeral(bid.advertiserPeer).format('$ 0,0.00')] })}
          name='bidPerSpace'
          step='0.01'
          value={bid.advertiserPeer}
          onChange={(value) => this.props.handleChange('advertiserPeer', parseFloat(value, 10))}
        />
        <Input
          type='number'
          required
          label={t('SPACES_COUNT_N', { args: [numeral(bid.requiredPoints).format('0,0')] })}
          name='spaces'
          step={SPACES_COUNT_STEP}
          max={EJ_MAX_SPACES}
          value={bid.requiredPoints}
          onChange={(value) => this.props.handleChange('requiredPoints', parseInt(value, 10))}
        />
        <br />
        <div>
          <span> {t('TOTAL_BID_AMOUNT')} </span>
          <strong> {numeral(bid.advertiserPeer * bid.requiredPoints).format('$ 0,0.00')} </strong>
        </div>
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

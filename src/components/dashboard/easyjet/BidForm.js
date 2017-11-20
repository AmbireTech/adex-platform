import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Button, IconButton } from 'react-toolbox/lib/button'
import theme from './theme.css'
import Input from 'react-toolbox/lib/input'
import Bid from 'models/Bid'

const EJ_MAX_SPACES = 2000000
const SPACES_COUNT_STEP = 10000
const MIN_BID_PRICE = 0.05

class BidForm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      bidPerSpace: MIN_BID_PRICE,
      spaces: SPACES_COUNT_STEP
    }
  }

  handleChange = (name, value) => {
    this.props.actions.updateNewBid({ bidId: this.props.bidId, key: name, value: value })
  }

  render() {
    let bid = this.props.bid || {}

    return (
      <div>
        <h1> {'EJ BID'} </h1>
        <Input
          type='number'
          required
          label='Bid per space in $'
          name='bidPerSpace'
          step='0.01'
          min={MIN_BID_PRICE}
          value={bid.adUnitIpfs || MIN_BID_PRICE}
          onChange={(value) => this.handleChange('adUnitIpfs', value)}
        />
        <Input
          type='number'
          required
          label='Spaces count'
          name='spaces'
          step={SPACES_COUNT_STEP}
          max={EJ_MAX_SPACES}
          min={SPACES_COUNT_STEP}
          value={bid.requiredPoints || SPACES_COUNT_STEP}
          onChange={(value) => this.handleChange('requiredPoints', value)}
        />
      </div>
    )
  }
}

BidForm.propTypes = {
  actions: PropTypes.object.isRequired,
  label: PropTypes.string,
  bid: PropTypes.object,
  bidId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

function mapStateToProps(state, props) {
  let persist = state.persist
  let memory = state.memory
  return {
    bid: memory.newBid[props.bidId] || new Bid().plainObj()
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BidForm)

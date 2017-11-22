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

const EJ_MAX_SPACES = 2000000
const SPACES_COUNT_STEP = 10000
const MIN_BID_PRICE = 0.05
export default function NewBidHoc(Decorated) {
  class BidForm extends Component {
    componentWillMount() {
      // NOTE: force update the props if the user decide to use the min values
      if (!this.props.bid.adUnitIpfs && !this.props.bid.SPACES_COUNT_STEP) {
        this.handleChange('adUnitIpfs', MIN_BID_PRICE)
        this.handleChange('requiredPoints', SPACES_COUNT_STEP)
      }
    }

    handleChange = (name, value) => {
      this.props.actions.updateNewBid({ bidId: this.props.bidId, key: name, value: value })
    }

    save = () => {
      let bid = { ...this.props.bid }
      // NOTE: convert to cents
      bid.adUnitIpfs = parseInt(bid.adUnitIpfs * 100, 10)
      // TODO: this ids (id, adSLot, adUnit) are temp for testing the reducer
      bid.id = this.props.bidsIds.length || 1
      bid.adSlot = 1
      bid.adUnit = 1

      this.props.actions.placeBid({ bid: bid })
      this.props.actions.resetNewBid({ bidId: this.props.bidId })

      // TODO: fix this and make something common to use here and in NewItemsHocStep...
      if (typeof this.props.onSave === 'function') {
        this.props.onSave()
      }

      if (Array.isArray(this.props.onSave)) {
        for (var index = 0; index < this.props.onSave.length; index++) {
          if (typeof this.props.onSave[index] === 'function') {
            this.props.onSave[index].onSave()
          }
        }
      }
    }

    render() {
      let bid = this.props.bid || {}
      let props = this.props

      return (
        <Decorated {...props} bid={bid} save={this.save} handleChange={this.handleChange} />
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
      bidsIds: persist.bids.bidsIds
    }
  }

  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(actions, dispatch)
    }
  }

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(Translate(BidForm))
}

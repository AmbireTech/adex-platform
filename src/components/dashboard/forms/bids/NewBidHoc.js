import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Bid } from 'adex-models'
import Translate from 'components/translate/Translate'
import scActions from 'services/smart-contracts/actions'
import { placeBid } from 'services/adex-node/actions'
const { signBid } = scActions

export default function NewBidHoc(Decorated) {
  class BidForm extends Component {

    handleChange = (name, value) => {
      this.props.actions.updateNewBid({ bidId: this.props.bidId, key: name, value: value })
    }

    onSave = () => {
      if (typeof this.props.onSave === 'function') {
        this.props.onSave()
      }

      if (Array.isArray(this.props.onSave)) {
          for (var index = 0; index < this.props.onSave.length; index++) {
              if (typeof this.props.onSave[index] === 'function') {
                  this.props.onSave[index]()
              }
          }
      }

      this.props.actions.resetNewBid({bidId: this.props.bidId})
    }

    save = () => {
      const t = this.props.t
      let bid = { ...this.props.bid }
      let unit = this.props.adUnit
      let bidInst = new Bid(bid)
      let userAddr = this.props.account._addr
      let authSig = this.props.account._authSig
      bidInst.adUnit = unit._ipfs
      bidInst.adUnitId = unit._id
      bidInst.advertiser = this.props.account._addr

      signBid({ userAddr: userAddr, authSig: authSig, bid: bidInst })
        .then((sig) => {
          bidInst.signature = sig
          bidInst._id = sig.hash

          return placeBid({ bid: bidInst.plainObj(), userAddr: userAddr, authSig: authSig })
        })
        .then((bid) => {
          this.props.actions.addToast({ type: 'accept', action: 'X', label: t('BID_PLACED_MSG', {args: [bid._id]}), timeout: 5000 })
          this.onSave()
        })
        .catch((err) => {
          this.props.actions.addToast({ type: 'cancel', action: 'X', label: t('ERR_PLACE_BID', {args: [err.message || err]}), timeout: 5000 })
          this.onSave()
        })
    }

    cancel = () => {
      this.onSave()
    }

    render() {
      let bid = this.props.bid || {}
      let props = this.props

      return (
        <Decorated {...props} bid={bid} save={this.save} handleChange={this.handleChange} cancel={this.cancel}/>
      )
    }
  }

  BidForm.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    bid: PropTypes.object,
    bidId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    bidsIds: PropTypes.array,
    account: PropTypes.object.isRequired
  }

  function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
      account: persist.account,
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

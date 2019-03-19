import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Bid } from 'adex-models'
import Translate from 'components/translate/Translate'
import Helper from 'helpers/miscHelpers'
import scActions from 'services/smart-contracts/actions'
import { placeBid } from 'services/adex-node/actions'
const { signBid } = scActions

export const getSpinnerId = (bidId) =>
	'new-bid-wallet-action-' + bidId

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

    	this.props.actions.resetNewBid({ bidId: this.props.bidId })
    	this.props.actions.updateSpinner(getSpinnerId(this.props.bidId), false)
    }

    save = () => {
    	this.props.actions.updateSpinner(getSpinnerId(this.props.bidId), true)
    	const t = this.props.t
    	let bid = { ...this.props.bid }
    	let unit = this.props.adUnit
    	let bidInst = new Bid(bid)
    	let user = this.props.account
    	let userAddr = user._addr
    	let authSig = this.props.account._authSig
    	bidInst.adUnit = unit._ipfs
    	bidInst.adUnitId = unit._id
    	bidInst.advertiser = this.props.account._addr
    	bidInst.tags = unit.tags

    	signBid({ userAddr: userAddr, authSig: authSig, bid: bidInst, user: user })
    		.then((sig) => {
    			bidInst.signature = sig
    			bidInst._id = sig.hash

    			return placeBid({ bid: bidInst.plainObj(), userAddr: userAddr, authSig: authSig })
    		})
    		.then((bid) => {
    			this.props.actions.addToast({ type: 'accept', action: 'X', label: t('BID_PLACED_MSG', { args: [bid._id] }), timeout: 5000 })
    			this.onSave()
    		})
    		.catch((err) => {
    			this.props.actions.addToast({ type: 'cancel', action: 'X', label: t('ERR_PLACE_BID', { args: [Helper.getErrMsg(err)] }), timeout: 5000 })
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
    		<Decorated {...props} bid={bid} save={this.save} handleChange={this.handleChange} cancel={this.cancel} />
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
		const persist = state.persist
		const memory = state.memory
		const bidId = props.bidId
		return {
			account: persist.account,
			bid: memory.newBid[bidId] || new Bid().plainObj(),
			bidsIds: persist.bids.bidsIds,
			// Needed for save btn and user action msg
			waitingForWalletAction: memory.spinners[getSpinnerId(bidId)]
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

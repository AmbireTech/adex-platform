import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Bid } from 'adex-models'
import NewBidHoc from './NewBidHoc'
import Grid from '@material-ui/core/Grid'
import { WalletAction } from 'components/dashboard/forms/FormsCommon'
import { PropRow, ContentBox, ContentBody, ContentStickyTop } from 'components/common/dialog/content'
import constants from 'adex-constants'

class BidFormPreview extends Component {
	render() {
		let bid = this.props.bid || {}
		let t = this.props.t
		// TODO: Make getter in the model
		let timeout = constants.exchange.timeoutsByValue[bid.timeout] || {}

		return (
			<ContentBox>
				{/* TODO: Add translations and format the numbers */}
				{this.props.waitingForWalletAction ?
					<ContentStickyTop>
						<WalletAction t={t} authType={this.props.account._authType} />
					</ContentStickyTop> : null}
				<ContentBody>
					<Grid container spacing={16}>
						<PropRow
							left={t('BID_TARGET_CLICKS')}
							right={bid.target}
						/>
						<PropRow
							left={t('BID_AMOUNT')}
							right={bid.amount}
						/>
						<PropRow
							left={t('BID_TIMEOUT')}
							right={t(timeout.label, { args: timeout.labelArgs })}
						/>
					</Grid>
				</ContentBody>
			</ContentBox>
		)
	}
}

BidFormPreview.propTypes = {
	actions: PropTypes.object.isRequired,
	label: PropTypes.string,
	bid: PropTypes.object,
	bidId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	bidsIds: PropTypes.array
}

function mapStateToProps(state, props) {
	const persist = state.persist
	const memory = state.memory
	const bidId = props.bidId
	return {
		bid: memory.newBid[bidId] || new Bid().plainObj(),
		bidsIds: persist.bids.bidsIds,
		bidId: bidId,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

let BidFormPreviewForm = NewBidHoc(BidFormPreview)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(BidFormPreviewForm)

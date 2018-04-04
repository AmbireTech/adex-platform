import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from 'components/dashboard/forms/theme.css'
import { Bid } from 'adex-models'
import NewBidHoc from './NewBidHoc'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { PropRow, StepBox, StepBody, StepStickyTop, WalletAction } from 'components/dashboard/forms/FormsCommon'
import constants from 'adex-constants'

class BidFormPreview extends Component {
  render() {
    let bid = this.props.bid || {}
    let t = this.props.t

    // TODO: Make getter in the model
    let timeout = constants.exchange.timeoutsByValue[bid.timeout] || {}

    return (
      <StepBox>
        {/* TODO: Add translations and format the numbers */}
        {/* {bid.waitingForWalletAction || true ?
          <StepStickyTop>
            <WalletAction t={t} authType={this.props.account._authMode.authType} />
          </StepStickyTop> : null} */}
        <StepBody>
          <Grid fluid>
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
        </StepBody>
      </StepBox>
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

let BidFormPreviewForm = NewBidHoc(BidFormPreview)
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BidFormPreviewForm)

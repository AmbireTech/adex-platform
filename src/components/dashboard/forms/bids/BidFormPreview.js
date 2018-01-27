import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from 'components/dashboard/forms/theme.css'
import { Bid } from 'adex-models'
import Translate from 'components/translate/Translate'
import NewBidHoc from './NewBidHoc'
import { Grid, Row, Col } from 'react-flexbox-grid'
import numeral from 'numeral'
import moment from 'moment'

class BidFormPreview extends Component {
  render() {
    let bid = this.props.bid || {}
    let t = this.props.t

    return (
      <div>
        {/* TODO: Add translations and format the numbers */}
        <Grid fluid>
          <Row>
            <Col xs={12} lg={4} className={theme.textRight}> {t('BID_TARGET_CLICKS')}:</Col>
            <Col xs={12} lg={8} className={theme.textLeft}>{bid.target} </Col>
          </Row>
          <Row>
            <Col xs={12} lg={4} className={theme.textRight}>{t('BID_AMOUNT')}:</Col>
            <Col xs={12} lg={8} className={theme.textLeft}>{bid.amount}</Col>
          </Row>
          <Row>
            <Col xs={12} lg={4} className={theme.textRight}>{t('BID_TIMEOUT')}:</Col>
            <Col xs={12} lg={8} className={theme.textLeft}>{bid.timeout.getTime()}</Col>
          </Row>
        </Grid>
      </div>
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

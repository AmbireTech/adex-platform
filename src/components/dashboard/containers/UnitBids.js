import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Tab, Tabs } from 'react-toolbox'
import { IconButton } from 'react-toolbox/lib/button'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'
import Translate from 'components/translate/Translate'
import Tooltip from 'react-toolbox/lib/tooltip'
import RTButtonTheme from 'styles/RTButton.css'
import { exchange as ExchangeConstants } from 'adex-constants'
import { CancelBid, VerifyBid, RefundBid } from 'components/dashboard/forms/web3/transactions'
import classnames from 'classnames'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS } from 'constants/misc'
import { getCommonBidData, renderCommonTableRow, renderTableHead, searchMatch } from './BidsCommon'

const TooltipIconButton = Tooltip(IconButton)
const { BID_STATES } = ExchangeConstants

export class UnitBids extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tabIndex: 0,
            detailsOpen: false
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    shouldComponentUpdate(nextProps, nextState) {
        // TODO: investigate why component receives props without change in the parent components and stre state props
        return (JSON.stringify(this.props) !== JSON.stringify(nextProps)) || (JSON.stringify(this.state) !== JSON.stringify(nextState))
    }

    onSave = () => {
        this.props.getUnitBids()
    }

    getBidData = (bid) => {
        const t = this.props.t
        let bidData = getCommonBidData({ bid, t, side: this.props.side })

        const transactions = this.props.transactions
        const pendingTransaction = transactions[bid.unconfirmedStateTrHash]
        const pendingState = !!pendingTransaction ? pendingTransaction.state : (bid.unconfirmedStateId || null)

        const canCancel = (bid._state === BID_STATES.DoesNotExist.id)
        const canVerify = (bid._state === BID_STATES.Accepted.id) && !bid._advertiserConfirmation
        const noTargetsReached = bid.clicksCount < bid._target
        const canRefund = (bid._state === BID_STATES.Accepted.id) && (bidData.bidExpires < Date.now()) && !bid._advertiserConfirmation
        const pendingCancel = pendingState === BID_STATES.Canceled.id
        const pendingRefund = pendingState === BID_STATES.Expired.id
        const pendingVerify = (pendingState === BID_STATES.ConfirmedAdv.id) || (bid.unconfirmedStateId === BID_STATES.Completed.id)
        const pendingAcceptByPub = bid.unconfirmedStateId === BID_STATES.Accepted.id

        bidData.cancelBtn = canCancel ? <CancelBid
            icon={pendingCancel ? 'hourglass_empty' : ''}
            adUnitId={bid._adUnitId}
            bidId={bid._id}
            placedBid={bid}
            acc={this.props.account}
            raised
            className={classnames(theme.actionBtn, RTButtonTheme.inverted, RTButtonTheme.dark)}
            onSave={this.onSave}
            disabled={pendingCancel}
        /> : null

        bidData.verifyBtn = canVerify ?
            <VerifyBid
                noTargetsReached
                icon={pendingVerify ? 'hourglass_empty' : (noTargetsReached ? '' : '')}
                itemId={bid._adUnitId}
                bidId={bid._id}
                placedBid={bid}
                acc={this.props.account}
                raised
                className={classnames(theme.actionBtn, RTButtonTheme.inverted, { [RTButtonTheme.warning]: noTargetsReached, [RTButtonTheme.success]: !noTargetsReached })}
                onSave={this.onSave}
                disabled={pendingVerify}
            /> : null

        bidData.refundBtn = canRefund ?
            <RefundBid
                icon={pendingRefund ? 'hourglass_empty' : ''}
                adUnitId={bid._adUnitId}
                bidId={bid._id}
                placedBid={bid}
                acc={this.props.account}
                raised
                className={classnames(theme.actionBtn, RTButtonTheme.inverted, RTButtonTheme.danger)}
                onSave={this.onSave}
                disabled={pendingRefund}
            /> : null

        bidData.pendingAcceptByPub = canCancel && pendingAcceptByPub ?
            <TooltipIconButton
                icon='warning'
                tooltip={t('WARNING_PENDING_ACCEPT_BY_PUB')}
                className={RTButtonTheme.warning}
            /> : null

        return bidData

    }

    renderTableRow = (bid, index, { to, selected }) => {
        const t = this.props.t
        const bidData = this.getBidData(bid)

        return renderCommonTableRow({ bidData, t })
    }

    renderRows = (items) =>
        <Rows
            multiSelectable={false}
            selectable={false}
            side={this.props.side}
            item={{}}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={renderTableHead.bind(this, { t: this.props.t })}
        />

    sortBids = (bids) => {
        const sorted = bids.reduce((memo, bid) => {
            if (bid._state === BID_STATES.DoesNotExist.id) {
                memo.open.push(bid)
            } else if (bid._state === BID_STATES.Accepted.id
                || bid._state === BID_STATES.ConfirmedAdv.id
                || bid._state === BID_STATES.ConfirmedPub.id) {
                memo.action.push(bid)
            } else {
                memo.closed.push(bid)
            }

            return memo
        }, { action: [], open: [], closed: [] })

        return sorted
    }

    render() {

        let bids = this.props.advBids || []
        let t = this.props.t
        const sorted = this.sortBids(bids)

        // console.log('sorted', sorted)

        return (
            <div>
                <Tabs
                    theme={theme}
                    index={this.state.tabIndex}
                    onChange={this.handleTabChange}
                >
                    <Tab label={t('BIDS_AWAITING_ACTION')}>
                        <ItemsList
                            items={sorted.action}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_OPEN')}>
                        <ItemsList
                            items={sorted.open}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_CLOSED')}>
                        <ItemsList
                            items={sorted.closed}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_STATISTICS')}>
                        <div>
                            {t('COMING_SOON')}
                            {/* {this.renderNonOpenedBidsChart(slotBids)} */}
                        </div>
                    </Tab>
                </Tabs>

            </div>
        )
    }
}

UnitBids.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    const persist = state.persist
    const memory = state.memory
    return {
        account: persist.account,
        transactions: persist.web3Transactions[persist.account._addr] || {},
        advBids: persist.bids.advBids,
        side: memory.nav.side
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
)(Translate(UnitBids))

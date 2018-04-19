import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Tab, Tabs } from 'react-toolbox'
import { TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import { IconButton } from 'react-toolbox/lib/button'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'
import Translate from 'components/translate/Translate'
import Tooltip from 'react-toolbox/lib/tooltip'
import RTButtonTheme from 'styles/RTButton.css'
import { adxToFloatView } from 'services/smart-contracts/utils'
import { Item } from 'adex-models'
import { exchange as ExchangeConstants } from 'adex-constants'
import { CancelBid, VerifyBid, RefundBid } from 'components/dashboard/forms/web3/transactions'
import classnames from 'classnames'
import moment from 'moment'
import Anchor from 'components/common/anchor/anchor'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS } from 'constants/misc'
import { PropRow, ContentBox, ContentBody } from 'components/common/dialog/content'
import WithDialog from 'components/common/dialog/WithDialog'
import { FontIcon } from 'react-toolbox/lib/font_icon'

const TooltipIconButton = Tooltip(IconButton)
const { BID_STATES, BidStatesLabels } = ExchangeConstants

// TODO: use colors with css 
const StateIcons = {
    [BID_STATES.DoesNotExist.id]: { icon: 'more_horiz', color: '#0277BD' },
    [BID_STATES.Accepted.id]: { icon: 'done', color: '#0277BD' },
    [BID_STATES.Canceled.id]: { icon: 'close', color: '#787878' },
    [BID_STATES.Expired.id]: { icon: 'access_time', color: '#FF5722' },
    [BID_STATES.Completed.id]: { icon: 'done_all', color: '#00ffbf' },
    [BID_STATES.ConfirmedAdv.id]: { icon: 'done', color: '#00E5FF' },
    [BID_STATES.ConfirmedPub.id]: { icon: 'done', color: '#00E5FF' },
}

const bidDetails = ({ bidData, t }) => {
    return (
        <ContentBox>
            <ContentBody>
                <PropRow left={t('BID_ID')} right={bidData._id} />
                <PropRow left={t('BID_AMOUNT')} right={bidData._amount} />
                <PropRow left={t('BID_TARGET')} right={bidData._target} />
                <PropRow left={t('BID_UNIQUE_CLICKS')} right={bidData.clicksCount} />
                <PropRow left={t('BID_STATE')} right={bidData._state} />
                <PropRow left={t('PUBLISHER')} right={bidData._publisher} />
                <PropRow left={t('AD_SLOT')} right={bidData._adSlot} />
                <PropRow left={t('TIMEOUT')} right={bidData.timeout} />
                <PropRow left={t('ACCEPTED')} right={bidData.accepted} />
                <PropRow left={t('EXPIRES')} right={bidData.bidExpires} />
                <PropRow left={t('REPORT_ADVERTISER')} right={bidData._advertiserConfirmation} />
                <PropRow left={t('REPORT_PUBLISHER')} right={bidData._publisherConfirmation} />
                <PropRow left={t('')}
                    right={

                        <div>
                            {bidData.cancelBtn}
                            {bidData.pendingAcceptByPub}
                            {bidData.verifyBtn}
                            {bidData.refundBtn}
                        </div>} />
            </ContentBody>
        </ContentBox>
    )
}

const BidDetailWithDialog = WithDialog(bidDetails)

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

    renderTableHead = () => {
        let t = this.props.t
        return (
            <TableHead>
                <TableCell> {t('DETAILS')} </TableCell>
                <TableCell> {t('BID_AMOUNT')} </TableCell>
                <TableCell> {t('BID_TARGET')} / {t('BID_UNIQUE_CLICKS')} </TableCell>
                <TableCell> {t('BID_STATE')} </TableCell>
                <TableCell> {t('PUBLISHER')} </TableCell>
                <TableCell> {t('AD_SLOT')} </TableCell>
                <TableCell> {t('TIMEOUT')} / {t('ACCEPTED')} / {t('EXPIRES')}  </TableCell>
                <TableCell> {t('REPORTS')}  </TableCell>
                <TableCell> {t('ACTIONS')} </TableCell>
            </TableHead>
        )
    }

    getBidData = (bid) => {
        const t = this.props.t
        const transactions = this.props.transactions
        const pendingTransaction = transactions[bid.unconfirmedStateTrHash]
        const pendingState = !!pendingTransaction ? pendingTransaction.state : (bid.unconfirmedStateId || null)

        const canCancel = (bid._state === BID_STATES.DoesNotExist.id)
        const canVerify = (bid._state === BID_STATES.Accepted.id) && !bid._advertiserConfirmation
        const noTargetsReached = bid.clicksCount < bid._target
        const accepted = (bid._acceptedTime || 0) * 1000
        const timeout = (bid._timeout || 0) * 1000
        const bidExpires = accepted ? (accepted + timeout) : null
        const canRefund = (bid._state === BID_STATES.Accepted.id) && (bidExpires < Date.now()) && !bid._advertiserConfirmation
        const pendingCancel = pendingState === BID_STATES.Canceled.id
        const pendingRefund = pendingState === BID_STATES.Expired.id
        const pendingVerify = (pendingState === BID_STATES.ConfirmedAdv.id) || (bid.unconfirmedStateId === BID_STATES.Completed.id)
        const pendingAcceptByPub = bid.unconfirmedStateId === BID_STATES.Accepted.id

        const bidData = {
            _id: bid._id || '-',
            _amount: adxToFloatView(bid._amount) + ' ADX',
            _target: bid._target,
            clicksCount: bid.clicksCount || '-',
            _state:
                <span className={theme.bidState}>
                    <FontIcon value={StateIcons[bid._state].icon} style={{ marginRight: 5, color: StateIcons[bid._state].color }} />
                    <span>{t(BidStatesLabels[bid._state])}</span>
                </span>,
            _publisher: <Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + bid._publisher} > {bid._publisher || '-'} </Anchor>,
            _adSlot: <Anchor target='_blank' href={Item.getIpfsMetaUrl(bid._adSlot, process.env.IPFS_GATEWAY)} > {bid._adSlot || '-'} </Anchor>,
            timeout: moment.duration(timeout, 'ms').humanize(),
            accepted: accepted ? moment(accepted).format('MMMM Do, YYYY, HH:mm:ss') : '-',
            bidExpires: bidExpires ? moment(bidExpires).format('MMMM Do, YYYY, HH:mm:ss') : '-',
            _publisherConfirmation: bid._publisherConfirmation ? <Anchor target='_blank' href={Item.getIpfsMetaUrl(bid._publisherConfirmation, process.env.IPFS_GATEWAY)} > {t('PUBLISHER')} </Anchor> : '-',
            _advertiserConfirmation: bid._advertiserConfirmation ? <Anchor target='_blank' href={Item.getIpfsMetaUrl(bid._advertiserConfirmation, process.env.IPFS_GATEWAY)} > {t('ADVERTISER')} </Anchor> : '-',
            cancelBtn: canCancel ? <CancelBid
                icon={pendingCancel ? 'hourglass_empty' : ''}
                adUnitId={bid._adUnitId}
                bidId={bid._id}
                placedBid={bid}
                acc={this.props.account}
                raised
                className={classnames(theme.actionBtn, RTButtonTheme.inverted, RTButtonTheme.dark)}
                onSave={this.onSave}
                disabled={pendingCancel}
            /> : null,
            verifyBtn: canVerify ?
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
                /> : null,
            refundBtn: canRefund ?
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
                /> : null,
            pendingAcceptByPub: canCancel && pendingAcceptByPub ?
                <TooltipIconButton
                    icon='warning'
                    tooltip={t('WARNING_PENDING_ACCEPT_BY_PUB')}
                    className={RTButtonTheme.warning}
                /> : null

        }

        return bidData

    }

    renderTableRow = (bid, index, { to, selected }) => {
        const t = this.props.t
        const bidData = this.getBidData(bid)

        return (
            <TableRow key={bid._id}>
                <TableCell>
                    <BidDetailWithDialog
                        btnLabel=''
                        title={bid._id}
                        t={t}
                        bidData={bidData}
                        icon='open_in_new'
                        iconButton
                    />
                </TableCell>
                <TableCell> {bidData._amount} </TableCell>
                <TableCell>
                    {bidData._target} / {bidData.clicksCount}
                </TableCell>
                <TableCell> {bidData._state} </TableCell>
                <TableCell
                    className={classnames(theme.compactCol, theme.ellipsis)}
                >
                    {bidData._publisher}
                </TableCell>
                <TableCell
                    className={classnames(theme.compactCol, theme.ellipsis)}
                >
                    {bidData._adSlot}
                </TableCell>
                <TableCell>
                    <div> {bidData.timeout} </div>
                    <div> {bidData.accepted} </div>
                    <div> {bidData.bidExpires} </div>
                </TableCell>
                <TableCell
                    className={classnames(theme.compactCol, theme.ellipsis)}
                >
                    <div> {bidData._publisherConfirmation} </div>
                    <div> {bidData._advertiserConfirmation} </div>
                </TableCell>
                <TableCell>
                    {bidData.cancelBtn}
                    {bidData.pendingAcceptByPub}
                    {bidData.verifyBtn}
                    {bidData.refundBtn}
                </TableCell>
            </TableRow >
        )

    }

    renderRows = (items) =>
        <Rows
            multiSelectable={false}
            selectable={false}
            side={this.props.side}
            item={{}}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={this.renderTableHead.bind(this)}
        />

    searchMatch = (bid) => {
        return (bid._id || '') +
            (bid._amount || '') +
            (bid._advertiser || '') +
            (bid._publisher || '') +
            (bid._timeout || '') +
            (bid._target || '')
    }

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
                            searchMatch={this.searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_OPEN')}>
                        <ItemsList
                            items={sorted.open}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={this.searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_CLOSED')}>
                        <ItemsList
                            items={sorted.closed}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={this.searchMatch}
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
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        transactions: persist.web3Transactions[persist.account._addr] || {},
        advBids: persist.bids.advBids
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

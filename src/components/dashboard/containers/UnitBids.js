
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
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

const TooltipIconButton = Tooltip(IconButton)
const { BID_STATES, BidStatesLabels } = ExchangeConstants

const SORT_PROPERTIES = [
    { value: '_state', label: '' },
    { value: '_target', label: '' },
    { value: '_amount', label: '' },
    { value: '_timeout', label: '' },
    /** traffic, etc. */
]

export class UnitBids extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        // TODO: investigate why component receives props without change in the parent components and stre state props
        return JSON.stringify(this.props) !== JSON.stringify(nextProps)
    }

    onSave = () => {
        this.props.getUnitBids()
    }

    renderTableHead() {
        let t = this.props.t
        return (
            <TableHead>
                <TableCell> {t('BID_AMOUNT')} </TableCell>
                <TableCell> {t('BID_TARGET')} / {t('BID_UNIQUE_CLICKS')} </TableCell>
                <TableCell> {t('BID_STATE')} </TableCell>
                <TableCell> {t('PUBLISHER')} </TableCell>
                <TableCell> {t('AD_SLOT')} </TableCell>
                <TableCell> {t('TIMEOUT')} / {t('ACCEPTED')} / {t('EXPIRES')}  </TableCell>
                <TableCell> {t('ACTIONS')} </TableCell>
            </TableHead>
        )
    }

    renderTableRow(bid, index, { to, selected }) {
        const t = this.props.t
        const transactions = this.props.transactions
        const pendingTransaction = transactions[bid.unconfirmedStateTrHash]
        const pendingState = !!pendingTransaction ? pendingTransaction.state : (bid.unconfirmedStateId || null)

        const canCancel = (bid._state === BID_STATES.DoesNotExist.id)
        const canVerify = (bid._state === BID_STATES.Accepted.id) && (bid.clicksCount >= bid._target)
        const accepted = (bid._acceptedTime || 0) * 1000
        const timeout = (bid._timeout || 0) * 1000
        const bidExpires = accepted ? (accepted + timeout) : null
        const canRefund = (bid._state === BID_STATES.Accepted.id) && (bidExpires < Date.now())
        const pendingCancel = pendingState === BID_STATES.Canceled.id
        const pendingRefund = pendingState === BID_STATES.Expired.id
        const pendingVerify = (pendingState === BID_STATES.ConfirmedAdv.id) || (bid.unconfirmedStateId === BID_STATES.Completed.id)
        const pendingAcceptByPub = bid.unconfirmedStateId === BID_STATES.Accepted.id

        return (
            <TableRow key={bid._id}>
                <TableCell> {adxToFloatView(bid._amount) + ' ADX'} </TableCell>
                <TableCell>
                    <div>
                        {bid._target}
                    </div>
                    <div>
                        {bid.clicksCount || '-'}
                    </div>
                </TableCell>
                <TableCell> {t(BidStatesLabels[bid._state])} </TableCell>
                <TableCell
                    className={classnames(theme.compactCol, theme.ellipsis)}
                >
                    <Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + bid._publisher} > {bid._publisher || '-'} </Anchor>
                </TableCell>
                <TableCell
                    className={classnames(theme.compactCol, theme.ellipsis)}
                >
                    <Anchor target='_blank' href={Item.getIpfsMetaUrl(bid._adSlot, process.env.IPFS_GATEWAY)} > {bid._adSlot || '-'} </Anchor>
                </TableCell>
                <TableCell>
                    <div>
                        {moment.duration(timeout, 'ms').humanize()}
                    </div>
                    <div>
                        {accepted ? moment(accepted).format('MMMM Do, YYYY, HH:mm:ss') : '-'}
                    </div>
                    <div>
                        {bidExpires ? moment(bidExpires).format('MMMM Do, YYYY, HH:mm:ss') : '-'}
                    </div>
                </TableCell>
                <TableCell>

                    {canCancel ?
                        <CancelBid
                            icon={pendingCancel ? 'hourglass_empty' : 'cancel'}
                            adUnitId={bid._adUnitId}
                            bidId={bid._id}
                            placedBid={bid}
                            acc={this.props.account}
                            raised
                            accent
                            className={theme.actionBtn}
                            onSave={this.onSave}
                            disabled={pendingCancel}
                        /> : null}
                    {canCancel && pendingAcceptByPub ?
                        <TooltipIconButton
                            icon='warning'
                            tooltip={t('WARNING_PENDING_ACCEPT_BY_PUB')}
                            className={RTButtonTheme.warning}
                        /> : null
                    }
                    {canVerify ?
                        <VerifyBid
                            icon={pendingVerify ? 'hourglass_empty' : 'check_circle'}
                            itemId={bid._adUnitId}
                            bidId={bid._id}
                            placedBid={bid}
                            acc={this.props.account}
                            raised
                            primary
                            className={theme.actionBtn}
                            onSave={this.onSave}
                            disabled={pendingVerify}
                        /> : null}
                    {canRefund ?
                        <RefundBid
                            icon={pendingRefund ? 'hourglass_empty' : 'cancel'}
                            adUnitId={bid._adUnitId}
                            bidId={bid._id}
                            placedBid={bid}
                            acc={this.props.account}
                            raised
                            accent
                            className={theme.actionBtn}
                            onSave={this.onSave}
                            disabled={pendingRefund}
                        /> : null}
                </TableCell>
            </TableRow >
        )

    }

    renderRows = (items) =>
        <Rows
            multiSelectable={false}
            selectable={false}
            side={this.props.side}
            item={items}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={this.renderTableHead.bind(this)}
        />

    searchMatch = (bid) => {
        return (bid._amount || '') +
            (bid._advertiser || '') +
            (bid._timeout || '') +
            (bid._target || '')
    }

    render() {

        let bids = this.props.bids || []

        return (
            <div>
                <ItemsList items={bids} listMode='rows' renderRows={this.renderRows.bind(this)} sortProperties={SORT_PROPERTIES} searchMatch={this.searchMatch} />
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
        transactions: persist.web3Transactions[persist.account._addr] || {}
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

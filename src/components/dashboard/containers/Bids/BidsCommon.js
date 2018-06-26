
import React from 'react'
import { PropRow, ContentBox, ContentBody } from 'components/common/dialog/content'
import { exchange as ExchangeConstants } from 'adex-constants'
import Anchor from 'components/common/anchor/anchor'
import moment from 'moment'
import { adxToFloatView } from 'services/smart-contracts/utils'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCellMui from '@material-ui/core/TableCell'
import IconButton from '@material-ui/core/IconButton'
import WithDialog from 'components/common/dialog/WithDialog'
import classnames from 'classnames'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import ItemIpfsDetails from './../ItemIpfsDetails'
import { AcceptBid, GiveupBid, VerifyBid, CancelBid, RefundBid } from 'components/dashboard/forms/web3/transactions'
import Tooltip from '@material-ui/core/Tooltip'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'
import WarningIcon from '@material-ui/icons/Warning'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const RRAnchor = withReactRouterLink(Anchor)
const ItemIpfsDetailsDialog = WithDialog(ItemIpfsDetails)

const { BID_STATES, BidStatesLabels } = ExchangeConstants

const TableCell = ({ children, ...rest }) =>
    <TableCellMui
        padding='dense'
        {...rest}
    >
        {children}
    </TableCellMui >

export const StateIcons = {
    [BID_STATES.DoesNotExist.id]: { icon: 'more_horiz', color: '#0277BD' },
    [BID_STATES.Accepted.id]: { icon: 'done', color: '#0277BD' },
    [BID_STATES.Canceled.id]: { icon: 'close', color: '#787878' },
    [BID_STATES.Expired.id]: { icon: 'access_time', color: '#FF5722' },
    [BID_STATES.Completed.id]: { icon: 'done_all', color: '#00ffbf' },
    [BID_STATES.ConfirmedAdv.id]: { icon: 'done', color: '#00E5FF' },
    [BID_STATES.ConfirmedPub.id]: { icon: 'done', color: '#00E5FF' },
}

export const bidDetails = ({ bidData, t, side }) => {

    return (
        <ContentBox>
            <ContentBody>
                <PropRow left={t('BID_ID')} right={bidData._id} />
                <PropRow left={t('BID_AMOUNT')} right={bidData._amount} />
                <PropRow left={t('BID_TARGET')} right={bidData._target} />
                <PropRow left={t('BID_UNIQUE_CLICKS')} right={bidData.clicksCount} />
                <PropRow left={t('BID_STATE')} right={bidData._state} />
                <PropRow left={t(bidData.sideData.label)} right={bidData.sideData.owner} />
                <PropRow left={t('AD_SLOT')} right={bidData._adSlot} />
                <PropRow left={t('AD_UNIT')} right={bidData._adUnit} />
                <PropRow left={t('TIMEOUT')} right={bidData.timeoutLabel} />
                <PropRow left={t('ACCEPTED')} right={bidData.acceptedLabel} />
                <PropRow left={t('EXPIRES')} right={bidData.bidExpiresLabel} />
                <PropRow left={t('REPORT_ADVERTISER')} right={bidData._advertiserConfirmation} />
                <PropRow left={t('REPORT_PUBLISHER')} right={bidData._publisherConfirmation} />
                <PropRow left={t('')}
                    right={
                        <div>
                            {bidData.cancelBtn || null}
                            {bidData.pendingAcceptByPub || null}
                            {bidData.verifyBtn || null}
                            {bidData.refundBtn || null}
                            {bidData.acceptBid || null}
                            {bidData.giveupBid || null}
                        </div>}
                />
            </ContentBody>
        </ContentBox>
    )
}

const BidDetailWithDialog = WithDialog(bidDetails)

export const renderTableHead = ({ t, side, }) => {
    return (
        <TableHead>
            <TableRow>
                <TableCell> {t('DETAILS')} </TableCell>
                <TableCell > {t('BID_AMOUNT')} </TableCell>
                <TableCell> {t('BID_TARGET')} / {t('BID_UNIQUE_CLICKS')} </TableCell>
                <TableCell> {t('BID_STATE')} </TableCell>
                {/* TODO: make this check only at 1 place */}
                <TableCell> {t(side === 'publisher' ? 'ADVERTISER' : 'PUBLISHER')} </TableCell>
                <TableCell>
                    {t('AD_SLOT') + ' / ' + t('AD_UNIT')}
                </TableCell>
                <TableCell> {t('TIMEOUT')} / {t('ACCEPTED')} / {t('EXPIRES')}  </TableCell>
                <TableCell> {t('REPORTS')}  </TableCell>
                <TableCell> {t('ACTIONS')} </TableCell>
            </TableRow>
        </TableHead>
    )
}

export const renderCommonTableRow = ({ bidData, t, side, classes = {} }) => {
    return (
        <TableRow
            key={bidData._id}
            hover={true}
        >
            <TableCell>
                <BidDetailWithDialog
                    btnLabel=''
                    title={bidData._id}
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
                className={classnames(classes.compactCol)}
            >
                <Typography noWrap>
                    {bidData.sideData.owner}
                </Typography>
            </TableCell>
            <TableCell>
                <div>
                    {bidData._adSlot}
                </div>
                <div>
                    {bidData._adUnit}
                </div>
            </TableCell>
            <TableCell>
                <div> {bidData.timeoutLabel} </div>
                <div> {bidData.acceptedLabel} </div>
                <div> {bidData.bidExpiresLabel} </div>
            </TableCell>
            <TableCell
                className={classnames(classes.compactCol, classes.ellipsis)}
            >
                <div> {bidData._publisherConfirmation} </div>
                <div> {bidData._advertiserConfirmation} </div>
            </TableCell>
            <TableCell>
                {bidData.cancelBtn || null}
                {bidData.pendingAcceptByPub || null}
                {bidData.verifyBtn || null}
                {bidData.refundBtn || null}
                {bidData.acceptBid || null}
                {bidData.giveupBid || null}
            </TableCell>
        </TableRow >
    )
}

export const BidCommonTableRow = withStyles(styles)(renderCommonTableRow)

export const renderTableHeadStats = ({ t, side, }) => {
    return (
        <TableHead>
            <TableRow>
                <TableCell> {t('DETAILS')} </TableCell>
                <TableCell > {t('BID_ID')} </TableCell>
                <TableCell> {t('BID_AMOUNT')} </TableCell>
                <TableCell> {t('BID_TARGET')} / {t('BID_UNIQUE_CLICKS')} </TableCell>
                <TableCell> {t('BID_STATE')} </TableCell>
                <TableCell> {t('BID_PERIOD_UNIQUE_CLICKS')}</TableCell>
                <TableCell> {t('BID_PERIOD_CLICKS')} </TableCell>
                <TableCell> {t('BID_PERIOD_IMPRESSIONS')} </TableCell>
                <TableCell> {t('BID_ESTIMATED_REVENUE')} </TableCell>
            </TableRow>
        </TableHead>
    )
}

export const renderCommonTableRowStats = ({ bidData, t, side, classes }) => {
    const statsUniqueClicks = bidData.statistics.daily.uniqueClick || 0
    return (
        <TableRow key={bidData._id}>
            <TableCell>
                <BidDetailWithDialog
                    btnLabel=''
                    title={bidData._id}
                    t={t}
                    bidData={bidData}
                    icon='open_in_new'
                    iconButton
                />
            </TableCell>
            <TableCell
                className={classnames(classes.compactCol)}
            >
                <Typography noWrap>
                    {bidData._id}
                </Typography >
            </TableCell>
            <TableCell> {bidData._amount} </TableCell>
            <TableCell>
                {bidData._target} / {bidData.clicksCount}
            </TableCell>
            <TableCell> {bidData._state} </TableCell>
            <TableCell>
                {statsUniqueClicks}
            </TableCell>
            <TableCell>
                {bidData.statistics.daily.clicks || 0}
            </TableCell>
            <TableCell>
                {bidData.statistics.daily.loaded || 0}
            </TableCell>
            <TableCell>
                {statsUniqueClicks > 0 ?
                    (adxToFloatView(Math.floor(parseInt(bidData.amount, 10) / parseInt(bidData._target, 10)) * statsUniqueClicks))
                    : 0}
                {' ADX'}
            </TableCell>
        </TableRow >
    )
}

export const CommonTableRowStats = withStyles(styles)(renderCommonTableRowStats)

export const getCommonBidData = ({ bid, t, side }) => {

    const accepted = (bid._acceptedTime || 0) * 1000
    const timeout = (bid._timeout || 0) * 1000
    const bidExpires = accepted ? (accepted + timeout) : null

    let sideData = {}

    if (side === 'publisher') {
        sideData.label = 'ADVERTISER'
        sideData.owner = <Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + bid._advertiser} > {bid._advertiser || '-'} </Anchor>
    } else if (side === 'advertiser') {
        sideData.label = 'PUBLISHER'
        sideData.owner = <Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + bid._publisher} > {bid._publisher || '-'} </Anchor>
    }

    const bidData = {
        _id: bid._id || '-',
        _amount: adxToFloatView(bid._amount) + ' ADX',
        amount: bid._amount,
        _target: bid._target,
        clicksCount: bid.clicksCount || '-',
        _state:
            <span
            // className={theme.bidState}
            >
                <Icon
                    style={{ marginRight: 5, color: StateIcons[bid._state].color }}
                >
                    {StateIcons[bid._state].icon}
                </Icon>
                {/* <FontIcon value={StateIcons[bid._state].icon} style={{ marginRight: 5, color: StateIcons[bid._state].color }} /> */}
                <span>{t(BidStatesLabels[bid._state])}</span>
            </span>,
        sideData: sideData,
        accepted: accepted,
        timeout: timeout,
        bidExpires: bidExpires,
        timeoutLabel: moment.duration(timeout, 'ms').humanize(),
        acceptedLabel: accepted ? moment(accepted).format('MMMM Do, YYYY, HH:mm:ss') : '-',
        bidExpiresLabel: bidExpires ? moment(bidExpires).format('MMMM Do, YYYY, HH:mm:ss') : '-',
        statistics: bid.statistics,
        _publisherConfirmation: bid._publisherConfirmation ?
            <ItemIpfsDetailsDialog
                btnLabel={t('PUBLISHER')}
                itemIpfs={bid._publisherConfirmation}
                t={t}
                icon=''
                title={t('REPORT_PUBLISHER')}
                detailsType='report'
                textButton
            />
            : '-',
        _advertiserConfirmation: bid._advertiserConfirmation ?
            // <Anchor target='_blank' href={Item.getIpfsMetaUrl(bid._advertiserConfirmation, process.env.IPFS_GATEWAY)} > {t('ADVERTISER')} </Anchor>
            <ItemIpfsDetailsDialog
                btnLabel={t('ADVERTISER')}
                itemIpfs={bid._advertiserConfirmation}
                t={t}
                icon=''
                title={t('REPORT_ADVERTISER')}
                detailsType='report'
                textButton
            />
            : '-',
        // NOTE: Temp used filter from the existing slots in ItemHoc
        _adSlot: side === 'publisher' ?
            <RRAnchor to={'/dashboard/publisher/adSlot/' + (bid._adSlotId || bid._adSlot)}>{t('AD_SLOT')}</RRAnchor>
            : <ItemIpfsDetailsDialog
                btnLabel={t('AD_SLOT')}
                itemIpfs={bid._adSlot}
                t={t}
                icon=''
                title={t('AD_SLOT') + ': ' + bid._adSlot}
                detailsType='item'
                textButton
            />,
        _adUnit: side === 'advertiser' ?
            <RRAnchor to={'/dashboard/advertiser/adUnit/' + bid._adUnitId}>{t('AD_UNIT')}</RRAnchor>
            : <ItemIpfsDetailsDialog
                btnLabel={t('AD_UNIT')}
                itemIpfs={bid._adUnit}
                t={t}
                icon=''
                title={t('AD_UNIT') + ': ' + bid._adUnit}
                detailsType='item'
                textButton
            />
    }

    return bidData
}

export const getPublisherBidData = ({ bid, t, transactions, side, item, account, onSave }) => {
    const pendingTransaction = transactions[bid.unconfirmedStateTrHash]
    const pendingState = !!pendingTransaction ? pendingTransaction.state : (bid.unconfirmedStateId || null)

    const noTargetsReached = bid.clicksCount < bid._target
    const canAccept = (bid._state === BID_STATES.DoesNotExist.id)
    const canVerify = (bid._state === BID_STATES.Accepted.id) && ((bid.clicksCount >= bid._target) || bid._advertiserConfirmation)
    const canGiveup = bid._state === BID_STATES.Accepted.id
    const pendingGiveup = pendingState === BID_STATES.Canceled.id
    const pendingAccept = pendingState === BID_STATES.Accepted.id
    const pendingVerify = (pendingState === BID_STATES.ConfirmedPub.id) || (bid.unconfirmedStateId === BID_STATES.Completed.id)

    let bidData = getCommonBidData({ bid, t, side: side })

    bidData.acceptBid = canAccept ? <AcceptBid
        icon={pendingAccept ? 'hourglass_empty' : ''}
        adUnitId={bid._adUnitId}
        slotId={item._id}
        bidId={bid._id}
        placedBid={bid}
        slot={item}
        acc={account}
        variant='outlined'
        size='small'
        // primary
        // className={theme.actionBtn}
        onSave={onSave}
    // disabled={pendingAccept}
    /> : null

    bidData.verifyBtn = canVerify ?
        <VerifyBid
            noTargetsReached
            icon={pendingVerify ? 'hourglass_empty' : (noTargetsReached ? '' : '')}
            itemId={bid._adUnitId}
            bidId={bid._id}
            placedBid={bid}
            acc={account}
            variant='outlined'
            size='small'
            // className={classnames(theme.actionBtn, RTButtonTheme.inverted, { [RTButtonTheme.warning]: noTargetsReached, [RTButtonTheme.success]: !noTargetsReached })}
            onSave={onSave}
            disabled={pendingVerify}
        /> : null

    bidData.giveupBid = canGiveup ?
        <GiveupBid
            icon={pendingGiveup ? 'hourglass_empty' : ''}
            slotId={bid._adSlotId}
            bidId={bid._id}
            placedBid={bid}
            acc={account}
            variant='outlined'
            size='small'
            // className={classnames(theme.actionBtn, RTButtonTheme.inverted, RTButtonTheme.dark)}
            onSave={onSave}
            disabled={pendingGiveup}
        /> : null

    return bidData
}

export const getAdvertiserBidData = ({ bid, t, transactions, side, item, account, onSave }) => {
    let bidData = getCommonBidData({ bid, t, side: side })

    const pendingTransaction = transactions[bid.unconfirmedStateTrHash]
    const pendingState = !!pendingTransaction ? pendingTransaction.state : (bid.unconfirmedStateId || null)

    const canCancel = (bid._state === BID_STATES.DoesNotExist.id)
    const canVerify = (bid._state === BID_STATES.Accepted.id) && !bid._advertiserConfirmation
    const targetReached = bid.clicksCount >= bid._target
    const canRefund = (bid._state === BID_STATES.Accepted.id) && (bidData.bidExpires < Date.now()) && !bid._advertiserConfirmation
    const pendingCancel = pendingState === BID_STATES.Canceled.id
    const pendingRefund = pendingState === BID_STATES.Expired.id
    const pendingVerify = (pendingState === BID_STATES.ConfirmedAdv.id) || (bid.unconfirmedStateId === BID_STATES.Completed.id)
    const pendingAcceptByPub = bid.unconfirmedStateId === BID_STATES.Accepted.id

    bidData.cancelBtn = canCancel ?
        <CancelBid
            icon={pendingCancel ? 'hourglass_empty' : ''}
            adUnitId={bid._adUnitId}
            bidId={bid._id}
            placedBid={bid}
            acc={account}
            variant='outlined'
            size='small'
            // className={classnames(theme.actionBtn, RTButtonTheme.inverted, RTButtonTheme.dark)}
            onSave={onSave}
            disabled={pendingCancel}
        /> : null

    bidData.verifyBtn = canVerify ?
        <VerifyBid
            questionableVerify={!targetReached}
            icon={pendingVerify ? 'hourglass_empty' : ''}
            itemId={bid._adUnitId}
            bidId={bid._id}
            placedBid={bid}
            acc={account}
            variant='outlined'
            size='small'
            color={targetReached && 'primary'}
            // className={classnames(theme.actionBtn, RTButtonTheme.inverted, { [RTButtonTheme.warning]: !targetReached, [RTButtonTheme.success]: targetReached })}
            onSave={onSave}
            disabled={pendingVerify}
        /> : null

    bidData.refundBtn = canRefund ?
        <RefundBid
            questionableVerify={targetReached}
            icon={pendingRefund ? 'hourglass_empty' : ''}
            adUnitId={bid._adUnitId}
            bidId={bid._id}
            placedBid={bid}
            acc={account}
            variant='outlined'
            size='small'
            // className={classnames(theme.actionBtn, RTButtonTheme.inverted, RTButtonTheme.danger)}
            onSave={onSave}
            disabled={pendingRefund}
        /> : null

    bidData.pendingAcceptByPub = (canCancel && pendingAcceptByPub) &&
        <Tooltip
            title={t('WARNING_PENDING_ACCEPT_BY_PUB')}
        >
            <IconButton
            >
                <WarningIcon />
            </IconButton>
        </Tooltip >

    return bidData
}

export const getBidData = ({ bid, t, transactions, side, item, account, onSave }) => {
    if (side === 'advertiser') {
        return getAdvertiserBidData({ bid, t, transactions, side, item, account, onSave })
    } else if (side === 'publisher') {
        return getPublisherBidData({ bid, t, transactions, side, item, account, onSave })
    } else {
        return 'kor' // OR throw ?
    }
}

export const searchMatch = (bid) => {
    return (bid._id || '') +
        (bid._amount || '') +
        (bid._advertiser || '') +
        (bid._publisher || '') +
        (bid._timeout || '') +
        (bid._target || '')
}
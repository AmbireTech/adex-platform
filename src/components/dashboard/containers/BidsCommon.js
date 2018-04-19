
import React, { Component } from 'react'
import { PropRow, ContentBox, ContentBody } from 'components/common/dialog/content'
import { exchange as ExchangeConstants } from 'adex-constants'
import theme from './theme.css'
// import RTButtonTheme from 'styles/RTButton.css'
import Anchor from 'components/common/anchor/anchor'
import moment from 'moment'
import { adxToFloatView } from 'services/smart-contracts/utils'
import { FontIcon } from 'react-toolbox/lib/font_icon'
import { Item } from 'adex-models'
import { TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import WithDialog from 'components/common/dialog/WithDialog'
import classnames from 'classnames'

const { BID_STATES, BidStatesLabels } = ExchangeConstants

export const StateIcons = {
    [BID_STATES.DoesNotExist.id]: { icon: 'more_horiz', color: '#0277BD' },
    [BID_STATES.Accepted.id]: { icon: 'done', color: '#0277BD' },
    [BID_STATES.Canceled.id]: { icon: 'close', color: '#787878' },
    [BID_STATES.Expired.id]: { icon: 'access_time', color: '#FF5722' },
    [BID_STATES.Completed.id]: { icon: 'done_all', color: '#00ffbf' },
    [BID_STATES.ConfirmedAdv.id]: { icon: 'done', color: '#00E5FF' },
    [BID_STATES.ConfirmedPub.id]: { icon: 'done', color: '#00E5FF' },
}

export const bidDetails = ({ bidData, t, actions }) => {
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

export const renderTableHead = ({t}) => {

    console.log('t', t)
    // let t = this.props.t
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

export const renderCommonTableRow = ({bidData, t}) => {
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

export const getCommonBidData = ({ bid, transactions, t }) => {

    const accepted = (bid._acceptedTime || 0) * 1000
    const timeout = (bid._timeout || 0) * 1000
    const bidExpires = accepted ? (accepted + timeout) : null

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
        _advertiserConfirmation: bid._advertiserConfirmation ? <Anchor target='_blank' href={Item.getIpfsMetaUrl(bid._advertiserConfirmation, process.env.IPFS_GATEWAY)} > {t('ADVERTISER')} </Anchor> : '-'
    }

    return bidData
}

export const searchMatch = (bid) => {
    return (bid._id || '') +
        (bid._amount || '') +
        (bid._advertiser || '') +
        (bid._publisher || '') +
        (bid._timeout || '') +
        (bid._target || '')
}
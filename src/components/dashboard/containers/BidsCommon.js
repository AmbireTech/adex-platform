
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
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import ItemIpfsDetails from './ItemIpfsDetails'
import { Button } from 'react-toolbox/lib/button'

const RRButton = withReactRouterLink(Button)
const RRAnchor = withReactRouterLink(Anchor)
const ItemIpfsDetailsDialog = WithDialog(ItemIpfsDetails)

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
            <TableCell> {t('DETAILS')} </TableCell>
            <TableCell> {t('BID_AMOUNT')} </TableCell>
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
        </TableHead>
    )
}

export const renderCommonTableRow = ({ bidData, t, side }) => {
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
                {bidData.sideData.owner}
            </TableCell>
            <TableCell
                className={classnames(theme.compactCol, theme.ellipsis)}
            >
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

export const getCommonBidData = ({ bid, t, side }) => {

    const accepted = (bid._acceptedTime || 0) * 1000
    const timeout = (bid._timeout || 0) * 1000
    const bidExpires = accepted ? (accepted + timeout) : null

    let sideData = {}

    if (side === 'publisher') {
        sideData.label = 'ASVERTISER'
        sideData.owner = <Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + bid._advertiser} > {bid._advertiser || '-'} </Anchor>
    } else if (side === 'advertiser') {
        sideData.label = 'PUBLISHER'
        sideData.owner = <Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + bid._publisher} > {bid._publisher || '-'} </Anchor>
    }

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
        sideData: sideData,
        accepted: accepted,
        timeout: timeout,
        bidExpires: bidExpires,
        timeoutLabel: moment.duration(timeout, 'ms').humanize(),
        acceptedLabel: accepted ? moment(accepted).format('MMMM Do, YYYY, HH:mm:ss') : '-',
        bidExpiresLabel: bidExpires ? moment(bidExpires).format('MMMM Do, YYYY, HH:mm:ss') : '-',
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

export const searchMatch = (bid) => {
    return (bid._id || '') +
        (bid._amount || '') +
        (bid._advertiser || '') +
        (bid._publisher || '') +
        (bid._timeout || '') +
        (bid._target || '')
}
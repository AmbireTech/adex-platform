
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'
import moment from 'moment'
import { Tab, Tabs } from 'react-toolbox'
import { Grid, Row, Col } from 'react-flexbox-grid'
import BidsStatsGenerator from 'helpers/dev/bidsStatsGenerator'
import { BidsStatusBars, BidsStatusPie, SlotsClicksAndRevenue } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { getSlotBids, getAvailableBids } from 'services/adex-node/actions'
import { adxToFloatView } from 'services/smart-contracts/utils'
import { Item } from 'adex-models'
import { items as ItemsConstants, exchange as ExchangeConstants } from 'adex-constants'
import { AcceptBid, GiveupBid, VerifyBid } from 'components/dashboard/forms/web3/transactions'
import classnames from 'classnames'
import Anchor from 'components/common/anchor/anchor'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS_NO_STATE } from 'constants/misc'

const { ItemsTypes } = ItemsConstants
const { BID_STATES, BidStateNames, BidStatesLabels } = ExchangeConstants

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EBE', '#FAC']

export class SlotBids extends Component {

    constructor(props) {
        super(props)
        this.state = {
            tabIndex: 0,
            bids: [],
            openBids: [],
        }
    }

    // TODO: map bid and set amount to number or make something to parse the amount in the items list sort function
    getBids = () => {
        getSlotBids({
            authSig: this.props.account._authSig,
            adSlot: this.props.item._ipfs
        })
            .then((bids) => {
                // console.log('unit bids', bids)
                this.setState({ bids: bids })
            })

        getAvailableBids({
            authSig: this.props.account._authSig,
            sizeAndType: this.props.item.sizeAndType
        })
            .then((bids) => {
                // console.log('unit openBids', bids)
                this.setState({ openBids: bids })
            })
    }


    componentWillMount() {
        this.getBids()
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    getNonOpenedBidsChartData = (bids) => {
    }

    renderSlotsClicksCharts({ bids }) {
        let data = BidsStatsGenerator.getRandomStatsForSlots(bids, 'days')
        return (
            <SlotsClicksAndRevenue data={data} t={this.props.t} />
        )
    }

    renderNonOpenedBidsChart(bids, range) {
        let data = bids.reduce((memo, bid) => {
            if (bid) {
                let state = bid.state
                let statistics = memo.statistics
                let states = memo.states

                let val = statistics[state] || { state: state, value: state, count: 0, name: BidStateNames[state] }
                val.count = val.count + 1
                statistics[state] = val

                if (states[BidStateNames[state]] === undefined) {
                    states[BidStateNames[state]] = 1
                } else {
                    states[BidStateNames[state]] = (states[BidStateNames[state]] + 1)
                }

                return {
                    statistics: statistics,
                    states: states
                }
            } else {
                return memo
            }
        }, { statistics: [], states: {} })

        return (
            <div>
                <Grid fluid >
                    <Row middle='xs' className={theme.itemsListControls}>
                        <Col xs={12} sm={12} md={6}>
                            {/* {this.renderSlotsClicksCharts({ bids: this.props.bidsIds })} */}
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <BidsStatusBars data={data.states} t={this.props.t} />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <BidsStatusPie data={data.states} t={this.props.t} />
                        </Col>
                    </Row>
                </Grid>

            </div>
        )
    }

    renderTableHead() {
        let t = this.props.t
        return (
            <TableHead>
                <TableCell> {t('BID_AMOUNT')} </TableCell>
                <TableCell> {t('BID_TARGET')} / {t('BID_UNIQUE_CLICKS')} </TableCell>
                <TableCell> {t('BID_STATE')} </TableCell>
                <TableCell> {t('Advertiser')} </TableCell>
                <TableCell> {t('AD_UNIT')} </TableCell>
                <TableCell> {t('TIMEOUT')} / {t('ACCEPTED')} / {t('EXPIRES')}  </TableCell>
                <TableCell> {t('ACTIONS')} </TableCell>
            </TableHead>
        )
    }

    // TODO: make something common with unit bids 
    renderTableRow(bid, index, { to, selected }) {
        let t = this.props.t
        const transactions = this.props.transactions
        const pendingTransaction = transactions[bid.unconfirmedStateTrHash]
        const pendingState = !!pendingTransaction ? pendingTransaction.state : (bid.unconfirmedStateId || null)

        const canAccept = (bid._state === BID_STATES.DoesNotExist.id)
        const canVerify = (bid._state === BID_STATES.Accepted.id) && (bid.clicksCount >= bid._target)
        const canGiveup = bid._state === BID_STATES.Accepted.id
        const accepted = (bid._acceptedTime || 0) * 1000
        const timeout = (bid._timeout || 0) * 1000
        const bidExpires = accepted ? (accepted + timeout) : null
        const pendingGiveup = pendingState === BID_STATES.Canceled.id
        const pendingAccept = pendingState === BID_STATES.Accepted.id
        const pendingVerify = (pendingState === BID_STATES.ConfirmedPub.id) || (bid.unconfirmedStateId === BID_STATES.Completed.id)

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
                    <Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + bid._advertiser} > {bid._advertiser || '-'} </Anchor>
                </TableCell>
                <TableCell
                    className={classnames(theme.compactCol, theme.ellipsis)}
                >
                    {bid._adUnit ?
                        <Anchor target='_blank' href={Item.getIpfsMetaUrl(bid._adUnit, process.env.IPFS_GATEWAY)} > {bid._adUnit} </Anchor>
                        : '-'}
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
                <TableCell
                    className={classnames(theme.actionsCol)}
                >
                    {canAccept ?
                        <AcceptBid
                            icon={pendingAccept ? 'hourglass_empty' : 'check'}
                            adUnitId={bid._adUnitId}
                            slotId={this.props.item._id}
                            bidId={bid._id}
                            placedBid={bid}
                            slot={this.props.item}
                            acc={this.props.account}
                            raised
                            primary
                            className={theme.actionBtn}
                            onSave={this.getBids}
                            // disabled={pendingAccept}
                        /> : null}
                    {canVerify ?
                        <VerifyBid
                            icon={pendingVerify ? 'hourglass_empty' : 'check_circle'}
                            itemId={bid._adSlotId}
                            bidId={bid._id}
                            placedBid={bid}
                            acc={this.props.account}
                            raised
                            primary
                            className={theme.actionBtn}
                            onSave={this.getBids}
                            disabled={pendingVerify}
                        />
                        : null}
                    {canGiveup ?
                        <GiveupBid
                            icon={pendingGiveup ? 'hourglass_empty' : 'cancel'}
                            slotId={bid._adSlotId}
                            bidId={bid._id}
                            placedBid={bid}
                            acc={this.props.account}
                            raised
                            accent
                            className={theme.actionBtn}
                            onSave={this.getBids}
                            disabled={pendingGiveup}
                        />
                        : null}
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
        let openBids = this.state.openBids || []
        let slotBids = this.state.bids || []

        let t = this.props.t

        return (
            <div>
                <Tabs
                    theme={theme}
                    index={this.state.tabIndex}
                    onChange={this.handleTabChange}
                >
                    <Tab label={t('OPEN_BIDS')}>
                         <div>
                            <ItemsList 
                            items={openBids} 
                            listMode='rows'
                            renderRows={this.renderRows} 
                            sortProperties={SORT_PROPERTIES_BIDS} 
                            searchMatch={this.searchMatch} 
                            filterProperties={FILTER_PROPERTIES_BIDS_NO_STATE}
                            />
                        </div>
                    </Tab>
                    <Tab label={t('BIDS_HISTORY')}>
                        <div>
                            <ItemsList 
                                items={slotBids} 
                                listMode='rows'
                                renderRows={this.renderRows} 
                                sortProperties={SORT_PROPERTIES_BIDS} 
                                searchMatch={this.searchMatch} 
                                filterProperties={FILTER_PROPERTIES_BIDS}
                            />
                        </div>
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

SlotBids.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        // item: state.currentItem,
        spinner: memory.spinners[ItemsTypes.AdUnit.name],
        bids: persist.bids.bidsById,
        transactions: persist.web3Transactions[persist.account._addr] || {}
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(SlotBids))

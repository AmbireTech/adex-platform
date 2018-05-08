
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import RTButtonTheme from 'styles/RTButton.css'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'
import { Tab, Tabs } from 'react-toolbox'
import { Grid, Row, Col } from 'react-flexbox-grid'
import BidsStatsGenerator from 'helpers/dev/bidsStatsGenerator'
import { BidsStatusBars, BidsStatusPie, SlotsClicksAndRevenue, BidsTimeStatistics } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { getSlotBids, getAvailableBids } from 'services/adex-node/actions'
import { items as ItemsConstants, exchange as ExchangeConstants } from 'adex-constants'
import { AcceptBid, GiveupBid, VerifyBid } from 'components/dashboard/forms/web3/transactions'
import classnames from 'classnames'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS_NO_STATE } from 'constants/misc'
import { getCommonBidData, renderCommonTableRow, renderTableHead, searchMatch } from './BidsCommon'
import { getAddrBids, sortBids } from 'services/store-data/bids'
import { getBidEvents } from 'services/adex-node/actions'
import { IconButton } from 'react-toolbox/lib/button'

const { BID_STATES, BidStatesLabels } = ExchangeConstants

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EBE', '#FAC']

export class SlotBids extends Component {

    constructor(props) {
        super(props)
        this.state = {
            tabIndex: 3,
            bids: [],
            openBids: [],
            statsBids: []
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // TODO:
        return (JSON.stringify(this.props) !== JSON.stringify(nextProps)) || (JSON.stringify(this.state) !== JSON.stringify(nextState))
    }

    // TODO: map bid and set amount to number or make something to parse the amount in the items list sort function
    getBids = () => {
        if (this.props.getSlotBids) {
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
        } else {
            getAddrBids({ authSig: this.props.account._authSig })
        }
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
        // let data = BidsStatsGenerator.getRandomStatsForSlots(bids, 'days')
        return (
            <SlotsClicksAndRevenue data={bids} t={this.props.t} />
        )
    }

    mapBidToStatisticsData = ({ memo, interval, bid }) => {
        bid[interval].forEach((data) => {
            const intData = memo[data.timeInterval] || { clicks: 0, uniqueClicks: 0, loaded: 0 }
            intData.clicks += parseInt((data.clicks || 0), 10)
            intData.uniqueClicks += parseInt((data.uniqueClicks || 0), 10)
            intData.loaded += parseInt((data.loaded || 0), 10)

            memo[data.timeInterval] = intData
        })

        return memo
    }

    bidsStatsData = () => {
        return this.state.statsBids.reduce((memo, bid) => {
            if (bid) {

                memo.live = this.mapBidToStatisticsData({ memo: memo.live, interval: 'live', bid })
                memo.hourly = this.mapBidToStatisticsData({ memo: memo.hourly, interval: 'hourly', bid })
                memo.daily = this.mapBidToStatisticsData({ memo: memo.daily, interval: 'daily', bid })
            }

            return memo

        }, { live: {}, daily: {}, hourly: {} })
    }

    renderNonOpenedBidsChart(bids, range) {
        let statusData = bids.reduce((memo, bid) => {
            if (bid) {
                let state = bid._state
                let statistics = memo.statistics
                let states = memo.states

                let val = statistics[state] || { state: state, value: state, count: 0, name: BidStatesLabels[state] }
                val.count = val.count + 1
                statistics[state] = val

                if (states[BidStatesLabels[state]] === undefined) {
                    states[BidStatesLabels[state]] = 1
                } else {
                    states[BidStatesLabels[state]] = (states[BidStatesLabels[state]] + 1)
                }

                return {
                    statistics: statistics,
                    states: states
                }
            } else {
                return memo
            }
        }, { statistics: [], states: {} })

        let data = this.bidsStatsData()

        return (
            <div>
                <Grid fluid >
                    <Row middle='xs' className={theme.itemsListControls}>
                        <Col xs={12} sm={12} md={6}>
                            <BidsTimeStatistics data={data.live} t={this.props.t} />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <BidsTimeStatistics data={data.hourly} t={this.props.t} />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <BidsTimeStatistics data={data.daily} t={this.props.t} />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <BidsStatusBars data={statusData.states} t={this.props.t} />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <BidsStatusPie data={statusData.states} t={this.props.t} />
                        </Col>
                    </Row>
                </Grid>

            </div>
        )
    }

    getBidData = (bid) => {
        let t = this.props.t
        const transactions = this.props.transactions
        const pendingTransaction = transactions[bid.unconfirmedStateTrHash]
        const pendingState = !!pendingTransaction ? pendingTransaction.state : (bid.unconfirmedStateId || null)

        const noTargetsReached = bid.clicksCount < bid._target
        const canAccept = (bid._state === BID_STATES.DoesNotExist.id)
        const canVerify = (bid._state === BID_STATES.Accepted.id) && ((bid.clicksCount >= bid._target) || bid._advertiserConfirmation)
        const canGiveup = bid._state === BID_STATES.Accepted.id
        const pendingGiveup = pendingState === BID_STATES.Canceled.id
        const pendingAccept = pendingState === BID_STATES.Accepted.id
        const pendingVerify = (pendingState === BID_STATES.ConfirmedPub.id) || (bid.unconfirmedStateId === BID_STATES.Completed.id)

        let bidData = getCommonBidData({ bid, t, side: this.props.side })

        bidData.acceptBid = canAccept ? <AcceptBid
            icon={pendingAccept ? 'hourglass_empty' : ''}
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

        bidData.giveupBid = canGiveup ?
            <GiveupBid
                icon={pendingGiveup ? 'hourglass_empty' : ''}
                slotId={bid._adSlotId}
                bidId={bid._id}
                placedBid={bid}
                acc={this.props.account}
                raised
                className={classnames(theme.actionBtn, RTButtonTheme.inverted, RTButtonTheme.dark)}
                onSave={this.getBids}
                disabled={pendingGiveup}
            /> : null


        return bidData
    }

    // TODO: make something common with unit bids 
    renderTableRow(bid, index, { to, selected }) {
        let t = this.props.t
        const bidData = this.getBidData(bid)

        return renderCommonTableRow({ bidData, t })
    }

    renderRows = (items) =>
        <Rows
            multiSelectable={false}
            selectable={false}
            side={this.props.side}
            item={items}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={renderTableHead.bind(this, { t: this.props.t, side: this.props.side })}
        />

    render() {
        let openBids = this.state.openBids || []
        let t = this.props.t
        let sorted = []

        if (this.props.getSlotBids) {
            sorted = sortBids(this.state.bids || [])
        } else {
            sorted = this.props.pubBids
        }

        return (
            <div>
                {this.props.getSlotBids ? null :
                    <div className={classnames(theme.heading, theme.Transactions)}>
                        <h2 > {t('ALL_BIDS')} </h2>
                        <div>
                            <IconButton icon='info' onClick={() => {
                                getBidEvents({
                                    eventData: {
                                        bids: (sorted.active.concat(sorted.closed, sorted.acton)).reduce((memo, bid) => {
                                            if (bid && bid._id) {
                                                memo.push(bid._id)
                                            }

                                            return memo
                                        }, []),
                                        end: Date.now() - (0 * 24 * 60 * 60 * 1000),
                                        start: Date.now() - (7 * 24 * 60 * 60 * 1000)
                                    }
                                }).then((res) => {
                                    this.setState({ statsBids: res.data })
                                })
                            }
                            } />
                        </div>
                    </div>
                }
                <Tabs
                    theme={theme}
                    index={this.state.tabIndex}
                    onChange={this.handleTabChange}
                >
                    {this.props.getSlotBids ?
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
                        : null}
                    <Tab label={t('BIDS_READY_TO_VERIFY')}>
                        <ItemsList
                            items={sorted.action}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_ACTIVE')}>
                        <ItemsList
                            items={sorted.active}
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
                            searchMatch={this.searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('STATISTICS')}>
                        <div>
                            {/* {t('COMING_SOON')} */}
                            {this.renderNonOpenedBidsChart(sorted.action.concat(sorted.active, sorted.closed))}
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
    item: PropTypes.object
}

function mapStateToProps(state, props) {
    const persist = state.persist
    const memory = state.memory
    return {
        account: persist.account,
        bids: persist.bids.bidsById,
        transactions: persist.web3Transactions[persist.account._addr] || {},
        pubBids: persist.bids.pubBids,
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
)(Translate(SlotBids))


import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import { IconButton, Button } from 'react-toolbox/lib/button'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'
import moment from 'moment'
import { exchange } from 'adex-constants'
import { Tab, Tabs } from 'react-toolbox'
import { Grid, Row, Col } from 'react-flexbox-grid'
import BidsStatsGenerator from 'helpers/dev/bidsStatsGenerator'
import { BidsStatusBars, BidsStatusPie, SlotsClicksAndRevenue } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { getSlotBids, getAvailableBids } from 'services/adex-node/actions'
import { Item } from 'adex-models'
import { items as ItemsConstants } from 'adex-constants'
import { AcceptBid } from 'components/dashboard/forms/web3/transactions'
const { ItemsTypes } = ItemsConstants

const BidStateNames = exchange.BidStatesLabels

// import d3 from 'd3'

// const cardinal = d3.curveCardinal.tension(0.2)

const SORT_PROPERTIES = [
    { value: '_amount', label: '' },
    { value: '_target', label: '' },
    { value: '_timeout', label: '' },
    { value: '_advertiser', label: '' },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EBE', '#FAC']

export class SlotBids extends Component {

    constructor(props) {
        super(props)
        this.state = {
            bidding: false,
            activeSlot: {},
            tabIndex: 0,
            bids: [],
            openBids: [],
        }
    }

    componentWillMount() {
        getSlotBids({
            authSig: this.props.account._authSig,
            adSlot: this.props.item._id
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
                console.log('unit openBids', bids)
                this.setState({ openBids: bids })
            })
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
                <TableCell> {t('TOTAL_REWARD')} </TableCell>
                <TableCell> {t('CONVERSION_GOALS')} </TableCell>
                <TableCell> {t('ADVERTISER')} </TableCell>
                <TableCell> {t('AD_UNIT')} </TableCell>
                <TableCell> {t('TIMEOUT')} </TableCell>
                <TableCell> {t('ACTIONS')} </TableCell>
            </TableHead>
        )
    }

    renderTableRow(bid, index, { to, selected }) {
        let t = this.props.t
        return (
            <TableRow key={bid._id}>
                <TableCell> {bid._amount} </TableCell>
                <TableCell> {bid._target} </TableCell>
                <TableCell> {bid._advertiser} </TableCell>
                <TableCell>
                    {/*TODO: link to the meta or popup on click and the get tha meta or accept bid dialog whic will have the adunit meta info*/}
                    <a target='_blank' href={Item.getIpfsMetaUrl(bid._adUnit)} > {bid._adUnit} </a>
                </TableCell>
                <TableCell> {moment.duration(bid._timeout, 'ms').humanize()} </TableCell>
                <TableCell>
                    <AcceptBid
                        icon='check'
                        adUnitId={bid._adUnitId}
                        slotId={this.props.item._id}
                        bidId={bid._id}
                        placedBid={bid}
                        raised
                        primary
                        onSave={this.onSave}
                    />
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
            (bid.requiredPoints || '')
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
                    onChange={this.handleTabChange.bind(this)}
                >
                    <Tab label={t('OPEN_BIDS')}>
                        <div>
                            <ItemsList items={openBids} listMode='rows' delete renderRows={this.renderRows} sortProperties={SORT_PROPERTIES} searchMatch={this.searchMatch} />
                        </div>
                    </Tab>
                    <Tab label={t('BIDS_HISTORY')}>
                        <div>
                            <ItemsList items={slotBids} listMode='rows' delete renderRows={this.renderRows} sortProperties={SORT_PROPERTIES} searchMatch={this.searchMatch} />
                        </div>
                    </Tab>
                    <Tab label={t('BIDS_STATISTICS')}>
                        <div>
                            {this.renderNonOpenedBidsChart(slotBids)}
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
        bids: persist.bids.bidsById
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


import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemsTypes } from 'constants/itemsTypes'
import theme from './theme.css'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import { IconButton, Button } from 'react-toolbox/lib/button'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'
import moment from 'moment'
import { BidState, BidStateNames } from 'models/Bid'
import { Tab, Tabs } from 'react-toolbox'
import { Grid, Row, Col } from 'react-flexbox-grid'
import BidsStatsGenerator from 'helpers/dev/bidsStatsGenerator'
import { BidsStatusBars, BidsStatusPie, SlotsClicksAndRevenue } from 'components/dashboard/charts/slot'

// import d3 from 'd3'

// const cardinal = d3.curveCardinal.tension(0.2)

const SORT_PROPERTIES = [
    { value: 'id', label: 'Id' },
    { value: 'advertiser', label: 'Advertiser' },
    { value: 'amount', label: 'Total reward' },
    { value: 'requiredExecTime', label: 'Expiration date' }
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EBE', '#FAC']

export class SlotBids extends Component {

    constructor(props) {
        super(props)
        this.state = {
            bidding: false,
            activeSlot: {},
            tabIndex: 2
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    getNonOpenedBidsChartData = (bids) => {
    }

    renderSlotsClicksCharts({ bids }) {
        let data = BidsStatsGenerator.getRandomStatsForSlots(bids, 'days')
        return (
            <SlotsClicksAndRevenue data={data} />
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
                            {this.renderSlotsClicksCharts({ bids: this.props.bidsIds })}
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <BidsStatusBars data={data.states} />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <BidsStatusPie data={data.states} />
                        </Col>
                    </Row>
                </Grid>

            </div>
        )

    }

    renderTableHead() {
        return (
            <TableHead>
                <TableCell> {this.props.t('TOTAL_REWARD')} </TableCell>
                <TableCell> {this.props.t('CONVERSION_GOALS')} </TableCell>
                <TableCell> {this.props.t('ADVERTISER')} </TableCell>
                <TableCell> {this.props.t('EXPIRATION_DATE')} </TableCell>
                <TableCell> {this.props.t('ACTIONS')} </TableCell>
            </TableHead>
        )
    }

    renderTableRow(bid, index, { to, selected }) {
        return (
            <TableRow key={bid.id}>
                <TableCell> {bid.amount} </TableCell>
                <TableCell> {bid.requiredPoints} </TableCell>
                <TableCell> {bid.advertiser} </TableCell>
                <TableCell> {moment(bid.requiredExecTime).format('DD.MM.YYYY')} </TableCell>
                <TableCell> <Button label='ACCEPT' primary raised /> <Button label='REJECT' /> </TableCell>
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
        return (bid.name || '') +
            (bid.advertiser || '') +
            (bid.amount || '') +
            (bid.requiredPoints || '')
    }


    render() {
        let bidsIds = this.props.bidsIds
        let openBids = []
        let otherBids = []
        let allBids = []

        for (let i = 0; i < bidsIds.length; i++) {
            let bid = this.props.bids[bidsIds[i]]
            if (bid.state === BidState.Open) {
                openBids.push(bid)
            } else {
                otherBids.push(bid)
            }

            allBids.push(bid)
        }

        return (
            <div>
                <Tabs
                    theme={theme}
                    index={this.state.tabIndex}
                    onChange={this.handleTabChange.bind(this)}
                >
                    <Tab label='OPEN_BIDS'>
                        <div>
                            <ItemsList items={openBids} listMode='rows' delete renderRows={this.renderRows} sortProperties={SORT_PROPERTIES} searchMatch={this.searchMatch} />
                        </div>
                    </Tab>
                    <Tab label='BIDS_HISTORY'>
                        <div>
                            <ItemsList items={otherBids} listMode='rows' delete renderRows={this.renderRows} sortProperties={SORT_PROPERTIES} searchMatch={this.searchMatch} />
                        </div>
                    </Tab>
                    <Tab label='BIDS_STATISTICS'>
                        <div>
                            {this.renderNonOpenedBidsChart(allBids)}
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
    // items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    slots: PropTypes.array.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state, props) {
    return {
        account: state.account,
        slots: state.items[ItemsTypes.AdSlot.id],
        // item: state.currentItem,
        spinner: state.spinners[ItemsTypes.AdUnit.name],
        bidsIds: state.bids.bidsByAdslot[props.item._id],
        bids: state.bids.bidsById
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
)(SlotBids);

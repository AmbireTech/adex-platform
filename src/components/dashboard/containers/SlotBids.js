
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
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'

import BidsStatsGenerator from 'helpers/dev/bidsStatsGenerator'

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
        let data = BidsStatsGenerator.getRandomStatsForSlot(null, bids)
        return (
            <div style={{ width: 550, height: 300, display: 'inline-block' }}>
                <ResponsiveContainer>
                    <AreaChart data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />

                        {/* {<CartesianGrid />} */}
                        <Tooltip />
                        <Area yAxisId="left" type='monotone' dataKey='clicks' stroke='#ffd740' fill='#ffd740' fillOpacity={0.8} strokeOpacity={0.8} />
                        <Area yAxisId="right" type='monotone' dataKey='amount' stroke='#1b75bc' fill='#1b75bc' fillOpacity={0.8} strokeOpacity={0.8} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )
    }

    renderNonOpenedBidsChart(bids, range) {
        let data = bids.reduce((memo, bid) => {
            if (bid) {
                let state = bid.state

                let val = memo[state] || { state: state, value: state, count: 0, name: BidStateNames[state] }
                val.count = val.count + 1
                memo[state] = val
                return memo
            } else {
                return memo
            }
        }, [])

        return (
            <div>
                {this.renderSlotsClicksCharts({ bids: this.props.bidsIds })}
                <div style={{ width: 550, height: 300, display: 'inline-block' }}>
                    <ResponsiveContainer>
                        <BarChart data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <XAxis dataKey="name" />
                            <YAxis dataKey="count" />
                            {/* {<CartesianGrid />} */}
                            <Tooltip />
                            {<Bar type='monotone' dataKey='count' stroke='#ffd740' fill='#ffd740' fillOpacity={1} />}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ width: 550, height: 300, display: 'inline-block' }}>
                    <ResponsiveContainer>
                        <PieChart data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <Pie
                                data={data}
                                dataKey={'count'}

                                fillOpacity={1}
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={0}
                            >
                                {
                                    data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)
                                }
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
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

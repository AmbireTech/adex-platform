
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
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Line, Doughnut } from 'react-chartjs-2'
import { SlotsClicksChartsAlt } from 'components/dashboard/charts/slotsAreaCharts'
import { SlotsBidsAlt } from 'components/dashboard/charts/slotsPieCharts'
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

export class DashboardStats extends Component {

    constructor(props) {
        super(props)
        this.state = {
            bidsData: [],
            bidsStats: {}
        }
    }

    componentWillMount() {
        this.setState({
            bidsData: BidsStatsGenerator.getRandomStatsForSlots(this.props.bidsIds, 'days'),
            bidsStats: BidsStatsGenerator.getBidsStateStats()
        })
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    getNonOpenedBidsChartData = (bids) => {
    }

    renderSlotsClicksCharts({ data }) {
        return (
            <div style={{ width: '100%', height: 300 }}>
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

    render() {
        return (
            <div>
                <Grid fluid >
                    <Row middle='xs' className={theme.itemsListControls}>
                        <Col xs={12} sm={12} md={6}>
                            {this.renderSlotsClicksCharts({ data: this.state.bidsData })}
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <SlotsClicksChartsAlt data={this.state.bidsData} />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <SlotsBidsAlt data={this.state.bidsStats} />
                        </Col>
                        <Col xs={12} sm={12} md={6}>

                        </Col>
                    </Row>
                </Grid>

            </div>
        )
    }
}

DashboardStats.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    bidsIds: PropTypes.array.isRequired,

};

function mapStateToProps(state, props) {
    return {
        account: state.account,
        bidsIds: state.bids.bidsIds
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
)(DashboardStats);

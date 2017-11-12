
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
import { BidsStatusPie, SlotsClicksAndRevenue } from 'components/dashboard/charts/slot'
import BidsStatsGenerator from 'helpers/dev/bidsStatsGenerator'
import Translate from 'components/translate/Translate'

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

    render() {
        return (
            <div>
                <Grid fluid >
                    <Row middle='xs' className={theme.itemsListControls}>
                        <Col xs={12} sm={12} md={6}>
                            <SlotsClicksAndRevenue data={this.state.bidsData} t={this.props.t} />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <BidsStatusPie data={this.state.bidsStats} t={this.props.t} />
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
)(Translate(DashboardStats))

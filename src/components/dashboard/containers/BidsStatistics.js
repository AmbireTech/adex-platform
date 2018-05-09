
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { BidsStatusBars, BidsStatusPie, SlotsClicksAndRevenue, BidsTimeStatistics } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { exchange as ExchangeConstants } from 'adex-constants'
import { getBidEvents } from 'services/adex-node/actions'
import { Button } from 'react-toolbox/lib/button'
import Navigation from 'react-toolbox/lib/navigation'
import moment from 'moment'

const { BidStatesLabels } = ExchangeConstants

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EBE', '#FAC']

export class BidsStatistics extends Component {

    constructor(props) {
        super(props)
        this.state = {
            statsBids: []
        }
    }

    getBids = ({ start, end }) => {
        getBidEvents({
            eventData: {
                bids: (this.props.bids).reduce((memo, bid) => {
                    if (bid && bid._id) {
                        memo.push(bid._id)
                    }

                    return memo
                }, []),
                start: start,
                end: end
            }
        }).then((res) => {
            this.setState({ statsBids: res.data })
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        // TODO:
        return (JSON.stringify(this.props) !== JSON.stringify(nextProps)) || (JSON.stringify(this.state) !== JSON.stringify(nextState))
    }

    renderSlotsClicksCharts({ bids }) {
        // let data = BidsStatsGenerator.getRandomStatsForSlots(bids, 'days')
        return (
            <SlotsClicksAndRevenue data={bids} t={this.props.t} />
        )
    }

    mapBidToStatisticsData = ({ memo, interval, bid }) => {
        bid[interval].forEach((data) => {
            let format = ''

            if (data.interval <= 5 * 60 * 1000) {
                format = 'HH:mm'
            } else if (data.interval <= 60 * 60 * 1000) {
                format = 'HH:mm'
            } else if (data.interval <= 24 * 60 * 60 * 1000) {
                format = 'YYYY-MM-DD'
            }

            const key = moment(Math.floor(data.timeInterval * data.interval)).format(format)

            const intData = memo[key] || { clicks: 0, uniqueClicks: 0, loaded: 0 }
            intData.clicks += parseInt((data.clicks || 0), 10)
            intData.uniqueClicks += parseInt((data.uniqueClicks || 0), 10)
            intData.loaded += parseInt((data.loaded || 0), 10)

            memo[key] = intData
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
                        {/* <Col xs={12} sm={12} md={6}>
                            <BidsStatusBars data={statusData.states} t={this.props.t} />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            <BidsStatusPie data={statusData.states} t={this.props.t} />
                        </Col> */}
                    </Row>
                </Grid>
            </div>
        )
    }

    render() {
        let t = this.props.t
        return (
            <div>
                <Navigation>
                    <Button label={t('LABEL_LAST_24H')} onClick={() => this.getBids({ start: Date.now() - (24 * 60 * 60 * 1000), end: Date.now() })} />
                    <Button label={t('LABEL_THIS_WEEK')} onClick={() => this.getBids({ start: moment().startOf('isoWeek').valueOf(), end: moment().endOf('isoWeek').valueOf() })} />
                    <Button label={t('LABEL_LAST_WEEK')} onClick={() => this.getBids({ start: moment().subtract(1, 'week').startOf('isoWeek').valueOf(), end: moment().subtract(1, 'week').endOf('isoWeek').valueOf() })} />
                    <Button label={t('LABEL_THIS_MONTH')} onClick={() => this.getBids({ start: moment().startOf('month').valueOf(), end: moment().endOf('month').valueOf() })} />
                    <Button label={t('LABEL_LAST_MONTH')} onClick={() => this.getBids({ start: moment().subtract(1, 'month').startOf('isoMonth').valueOf(), end: moment().subtract(1, 'month').endOf('isoMonth').valueOf() })} />
                </Navigation>
                <br />
                <br />
                <div>
                    {this.renderNonOpenedBidsChart(this.props.bids)}
                </div>
            </div>
        )
    }
}

BidsStatistics.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    bids: PropTypes.array.isRequired
}

function mapStateToProps(state, props) {
    const persist = state.persist
    const memory = state.memory
    return {
        account: persist.account
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
)(Translate(BidsStatistics))

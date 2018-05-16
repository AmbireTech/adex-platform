
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import statisticsTheme from './bidsStatisticsTheme.css'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { BidsStatusBars, BidsStatusPie, SlotsClicksAndRevenue, BidsTimeStatistics } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { exchange as ExchangeConstants } from 'adex-constants'
import { getBidEvents } from 'services/adex-node/actions'
import { Button } from 'react-toolbox/lib/button'
import Navigation from 'react-toolbox/lib/navigation'
import moment from 'moment'
import Dropdown from 'react-toolbox/lib/dropdown'
import ItemsList from './ItemsList'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS } from 'constants/misc'
import { renderCommonTableRowStats, renderTableHeadStats, searchMatch, getBidData } from './BidsCommon'
import Rows from 'components/dashboard/collection/Rows'
import { Tab, Tabs } from 'react-toolbox'
import classnames from 'classnames'

const { BidStatesLabels } = ExchangeConstants

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EBE', '#FAC']

export class BidsStatistics extends Component {

    constructor(props) {
        super(props)
        this.state = {
            statistics: {},
            hourlyDaySelected: '',
            bidsStats: {},
            tabIndex: 0,
            filterIndex: null
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    getBids = ({ start, end }) => {
        getBidEvents({
            eventData: {
                bids: (this.props.bids || []).reduce((memo, bid) => {
                    if (bid && bid._id && (bid._acceptedTime * 1000) < end) {
                        memo.push(bid._id)
                    }

                    return memo
                }, []),
                start: start,
                end: end
            }
        }).then((res) => {
            this.setState({ statistics: res.stats, bidsStats: res.bidsStats })
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

    mapBidToStatisticsData = ({ stats = {}, interval, timeInterval }) => {
        // TODO: TEMP - make this mapping with params
        let mapped = {}

        Object.keys(stats).forEach((key) => {
            const data = stats[key]
            let format = ''
            let dayKey = ''
            let time = moment(Math.floor(parseInt(key, 10) * timeInterval))

            if (interval === 'live') {
                format = 'HH:mm'
            } else if (interval === 'hourly') {
                format = 'HH:mm'
                dayKey = time.format('YYYY-MM-DD')
            } else if (interval === 'daily') {
                format = 'DD MMMM'
            }

            const timeKey = time.format(format)
            let intData = null

            if (dayKey) {
                mapped[dayKey] = mapped[dayKey] || {}
                intData = mapped[dayKey][timeKey] || { clicks: 0, uniqueClicks: 0, loaded: 0 }
            } else {
                intData = mapped[timeKey] || { clicks: 0, uniqueClicks: 0, loaded: 0 }
            }

            intData.clicks += parseInt((data.clicks || 0), 10)
            intData.uniqueClicks += parseInt((data.uniqueClicks || 0), 10)
            intData.loaded += parseInt((data.loaded || 0), 10)

            if (dayKey) {
                mapped[dayKey][timeKey] = intData
            } else {
                mapped[timeKey] = intData
            }
        })

        return mapped
    }

    bidsStatsData = ({ stats = {} }) => {
        const liveData = stats.live || {}
        const hourlyData = stats.hourly || {}
        const dailyData = stats.daily || {}

        const data = {
            live: this.mapBidToStatisticsData({ stats: liveData.intervalStats, interval: 'live', timeInterval: liveData.interval }),
            hourly: this.mapBidToStatisticsData({ stats: hourlyData.intervalStats, interval: 'hourly', timeInterval: hourlyData.interval }),
            daily: this.mapBidToStatisticsData({ stats: dailyData.intervalStats, interval: 'daily', timeInterval: dailyData.interval })
        }

        return data
    }

    renderBidsPeriodStatistics = ({ stats }) => {

        let data = this.bidsStatsData({ stats: stats })
        return (
            <div>
                <Grid fluid >
                    <Row middle='xs' className={theme.itemsListControls}>
                        {Object.keys(data.live).length ?
                            <Col xs={12} sm={12} md={6}>
                                <BidsTimeStatistics data={data.live} t={this.props.t} />
                            </Col>
                            : null}
                        {Object.keys(data.hourly).length ?
                            <Col xs={12} sm={12} md={6}>
                                <Dropdown
                                    source={Object.keys(data.hourly).map((key) => { return { value: key, label: key } })}
                                    onChange={(val) => this.setState({ hourlyDaySelected: val })}
                                    label='LABEL_DD_SELECT_DAY'
                                    value={this.state.hourlyDaySelected || Object.keys(data.hourly)[0]}
                                />

                                {Object.keys(data.hourly).map((key) => {
                                    return (
                                        <div key={key} style={{ display: !this.state.hourlyDaySelected || (this.state.hourlyDaySelected === key) ? 'block' : 'none' }}>
                                            {/* <div> {key}</div> */}
                                            <BidsTimeStatistics data={data.hourly[key]} t={this.props.t} />
                                        </div>
                                    )
                                })}

                            </Col>
                            : null}
                        {Object.keys(data.daily).length ?
                            <Col xs={12} sm={12} md={6}>
                                <BidsTimeStatistics data={data.daily} t={this.props.t} />
                            </Col>
                            : null}
                    </Row>
                </Grid>
            </div>
        )

    }

    renderNonOpenedBidsChart = (bids, range) => {
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

    // TODO: Make common funcs, fix the statistics
    renderTableRow(bid, index, { to, selected }) {

        let t = this.props.t
        const bidInfo = this.props.bidsById[bid._id]

        if (!bidInfo) {
            return null
        }

        const bidAllData = { ...bidInfo }

        bidAllData.statistics = {
            live: bid.live,
            hourly: bid.hourly,
            daily: bid.daily,
        }

        // console.log('bidAllData', bidAllData)

        const bidData = getBidData({
            bid: bidAllData,
            t: t,
            transactions: this.props.transactions,
            side: this.props.side,
            item: this.props.item,
            account: this.props.account,
            onSave: this.getBids
        })

        // console.log('bidData', bidData)

        return renderCommonTableRowStats({ bidData, t })
    }

    renderRows = (items) =>
        <Rows
            multiSelectable={false}
            selectable={false}
            side={this.props.side}
            item={items}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={renderTableHeadStats.bind(this, { t: this.props.t, side: this.props.side })}
        />


    renderBidsTable({ bids }) {
        // console.log('bids', bids)
        return (<ItemsList
            items={Object.keys(bids).map((key) => {
                const bid = bids[key]
                bid._id = key

                return bid
            })}
            listMode='rows'
            renderRows={this.renderRows.bind(this)}
            sortProperties={SORT_PROPERTIES_BIDS}
            searchMatch={searchMatch}
            filterProperties={FILTER_PROPERTIES_BIDS}
        />)
    }

    applyPeriodFilter = ({ start, end, filterIndex }) => {
        this.setState({ filterIndex })
        this.getBids({ start, end })
    }

    render() {
        const t = this.props.t
        const filterIndex = this.state.filterIndex
        const tabIndex = this.state.tabIndex
        return (
            <div>
                <Navigation theme={statisticsTheme}>
                    <div className={statisticsTheme.navLeft}>
                        <div>
                            <Button
                                className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: filterIndex === 0 })}
                                inverse
                                label={t('LABEL_LAST_24H')}
                                onClick={() => this.applyPeriodFilter({ start: Date.now() - (24 * 60 * 60 * 1000), end: Date.now(), filterIndex: 0 })}
                            />

                            <Button
                                className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: filterIndex === 1 })}
                                inverse label={t('LABEL_THIS_WEEK')}
                                onClick={() => this.applyPeriodFilter({ start: moment().startOf('isoWeek').valueOf(), end: moment().endOf('isoWeek').valueOf(), filterIndex: 1 })}
                            />

                            <Button
                                className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: filterIndex === 2 })}
                                inverse
                                label={t('LABEL_LAST_WEEK')}
                                onClick={() => this.applyPeriodFilter({ start: moment().subtract(1, 'week').startOf('isoWeek').valueOf(), end: moment().subtract(1, 'week').endOf('isoWeek').valueOf(), filterIndex: 2 })}
                            />

                            <Button className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: filterIndex === 3 })}
                                inverse
                                label={t('LABEL_THIS_MONTH')}
                                onClick={() => this.applyPeriodFilter({ start: moment().startOf('month').valueOf(), end: moment().endOf('month').valueOf(), filterIndex: 3 })}
                            />

                            <Button
                                className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: filterIndex === 4 })}
                                inverse
                                label={t('LABEL_LAST_MONTH')}
                                onClick={() => this.applyPeriodFilter({ start: moment().subtract(1, 'month').startOf('month').valueOf(), end: moment().subtract(1, 'month').endOf('month').valueOf(), filterIndex: 4 })}
                            />
                        </div>
                        <div>

                        </div>
                    </div>
                    <div className={statisticsTheme.navRight}>
                        <Button
                            className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: tabIndex === 0 })}
                            inverse
                            icon='donut_large'
                            label={t('CHARTS')}
                            onClick={() => this.handleTabChange(0)}
                        />
                        <Button
                            className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: tabIndex === 1 })}
                            inverse
                            icon='list'
                            label={t('TABLE')}
                            onClick={() => this.handleTabChange(1)}
                        />
                    </div>
                </Navigation>
                <br />

                <div>
                    {this.state.tabIndex === 0 ?
                        this.renderBidsPeriodStatistics({ stats: this.state.statistics }) : null
                    }

                    {this.state.tabIndex === 1 ?
                        this.renderBidsTable({ bids: this.state.bidsStats }) : null
                    }
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
        account: persist.account,
        bidsById: persist.bids.bidsById,
        side: memory.nav.side,
        transactions: persist.web3Transactions[persist.account._addr] || {},
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

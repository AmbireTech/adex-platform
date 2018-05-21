import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import datepickerTheme from './datepicker.css'
import statisticsTheme from './bidsStatisticsTheme.css'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { BidsStatusBars, BidsStatusPie, SlotsClicksAndRevenue, BidsTimeStatistics } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { exchange as ExchangeConstants } from 'adex-constants'
import { getBidEvents } from 'services/adex-node/actions'
import { Button, IconButton } from 'react-toolbox/lib/button'
import Navigation from 'react-toolbox/lib/navigation'
import moment from 'moment'
import Dropdown from 'react-toolbox/lib/dropdown'
import ItemsList from './ItemsList'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS } from 'constants/misc'
import { renderCommonTableRowStats, renderTableHeadStats, searchMatch, getBidData } from './BidsCommon'
import Rows from 'components/dashboard/collection/Rows'
import { Tab, Tabs } from 'react-toolbox'
import classnames from 'classnames'
import DatePicker from 'react-toolbox/lib/date_picker'
import FontIcon from 'react-toolbox/lib/font_icon'
import ProgressBar from 'react-toolbox/lib/progress_bar'

const { BidStatesLabels } = ExchangeConstants
const SPINNER_ID = 'STATISTICS'

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EBE', '#FAC']

export class BidsStatistics extends Component {

    constructor(props) {
        super(props)
        this.state = {
            statistics: {},
            hourlyDaySelected: '',
            bidsStats: {},
            tabIndex: 0,
            filterIndex: 0,
            start: null,
            end: null,
            from: moment().subtract('days', 6),
            to: moment(),
            fullWidthChart: []
        }
    }

    toggleFullWidthChart = (chartID) => {
        const newCharts = [...this.state.fullWidthChart]
        const idIndex = newCharts.indexOf(chartID)

        if (idIndex > -1) {
            newCharts.splice(idIndex, 1)
        } else {
            newCharts.push(chartID)
        }

        this.setState({ fullWidthChart: newCharts })
    }

    isInFullWidthChart = (id) => {
        return this.state.fullWidthChart.indexOf(id) > -1
    }

    componentWillMount = () => {
        this.applyPeriodFilter({ start: Date.now() - (24 * 60 * 60 * 1000), end: Date.now(), filterIndex: 0 })
    }

    componentWillUnmount = () => {
        this.props.actions.updateSpinner(SPINNER_ID, false)
    }

    dateFormat = (value) => {
        return moment(value).format('DD MMMM')
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    handleChangeDatepickerChange = (prop, value) => {
        this.setState({ [prop]: value })
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
            this.setState({ statistics: res.stats || {}, bidsStats: res.bidsStats || {} })
            this.props.actions.updateSpinner(SPINNER_ID, false)
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
            intData.uniqueClicks += parseInt((data.uniqueClick || 0), 10)
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

    chartZoomBtn = ({ btnID }) => {
        return (
            <div style={{ textAlign: 'right' }}>
                <IconButton icon={this.isInFullWidthChart(btnID) ? 'fullscreen_exit' : 'fullscreen'} onClick={() =>
                    this.toggleFullWidthChart(btnID)
                } />
            </div>
        )
    }

    resizableCol = ({ id, stateId, children }) => {
        const cols = this.isInFullWidthChart(id) ? 12 : 6
        return (
            <Col
                key={id + cols} // NOTE: hack to escape react optimization and rerender the col
                xs={12}
                sm={12}
                md={cols}>
                {children}
            </Col>
        )
    }

    renderBidsPeriodStatistics = ({ stats }) => {
        const data = this.bidsStatsData({ stats: stats })
        const t = this.props.t
        return (
            <div>
                <Grid fluid >
                    <Row bottom='xs' className={theme.itemsListControls}>
                        {Object.keys(data.live).length ?
                            <this.resizableCol id='LIVE_CHART' >
                                <this.chartZoomBtn btnID='LIVE_CHART' />
                                <BidsTimeStatistics data={data.live} t={this.props.t} options={{ title: t('CHART_LIVE_TITLE'), col: this.isInFullWidthChart('LIVE_CHART') ? 12 : 6 }} />
                            </this.resizableCol >
                            : null}
                        {Object.keys(data.hourly).length ?
                            <this.resizableCol id='HOURLY_CHART' >
                                <Dropdown
                                    source={Object.keys(data.hourly).map((key) => { return { value: key, label: key } })}
                                    onChange={(val) => this.setState({ hourlyDaySelected: val })}
                                    label='LABEL_DD_SELECT_DAY'
                                    value={this.state.hourlyDaySelected || Object.keys(data.hourly)[0]}
                                />

                                <this.chartZoomBtn btnID='HOURLY_CHART' />
                                {Object.keys(data.hourly).map((key, index) => {
                                    return (
                                        <div key={key} style={{ display: (this.state.hourlyDaySelected === key) || (!this.state.hourlyDaySelected && index === 0) ? 'block' : 'none' }}>
                                            <BidsTimeStatistics data={data.hourly[key]} t={this.props.t} options={{ title: t('CHART_LIVE_HOURLY', { args: [key] }), col: this.isInFullWidthChart('HOURLY_CHART') ? 12 : 6 }} />
                                        </div>
                                    )
                                })}
                            </this.resizableCol >
                            : null}
                        {Object.keys(data.daily).length ?

                            <this.resizableCol id='DAILY_CHART' >
                                <this.chartZoomBtn btnID='DAILY_CHART' />
                                <BidsTimeStatistics data={data.daily} t={this.props.t} options={{ title: t('CHART_LIVE_DAILY'), col: this.isInFullWidthChart('DAILY_CHART') ? 12 : 6 }} />
                            </this.resizableCol >

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
            onSave: this.props.onSave
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
        this.props.actions.updateSpinner(SPINNER_ID, true)
        this.setState({ filterIndex, hourlyDaySelected: '', start, end })
        this.getBids({ start, end })
    }

    render() {
        const t = this.props.t
        const filterIndex = this.state.filterIndex
        const tabIndex = this.state.tabIndex
        let from = this.state.from ? new Date(this.state.from) : null
        let to = this.state.to ? new Date(this.state.to) : null
        let now = new Date()

        return (
            <div>
                <Navigation
                    theme={statisticsTheme}
                    className={statisticsTheme.nav}
                >
                    <div
                        className={statisticsTheme.navLeft}
                    >
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
                    </div>
                    <div
                        className={classnames(statisticsTheme.navRight, datepickerTheme.statsDatePicker, { [datepickerTheme.active]: filterIndex === 5 })}

                    >
                        <FontIcon value="date_range" />
                        <span>{t('from')} </span>
                        <DatePicker
                            label={this.props.t('from', { isProp: true })}
                            // minDate={now}
                            maxDate={now}
                            onChange={(val) => { this.handleChangeDatepickerChange('from', val) }}
                            value={from}
                            className={datepickerTheme.datepicker}
                            theme={datepickerTheme}
                            inputFormat={this.dateFormat}
                            size={moment(from).format('DD MMMM').length} /** temp fix */
                        />
                        <span>{t('to')} </span>
                        <DatePicker
                            label={this.props.t('to', { isProp: true })}
                            minDate={from || now}
                            maxDate={now}
                            onChange={(val) => { this.handleChangeDatepickerChange('to', val) }}
                            value={to}
                            className={datepickerTheme.datepicker}
                            theme={datepickerTheme}
                            inputFormat={this.dateFormat}
                            size={moment(to).format('DD MMMM').length} /** temp fix */
                        />
                        <Button
                            inverse
                            raised
                            label={t('APPLY')}
                            onClick={() => this.applyPeriodFilter({ start: moment(from).valueOf(), end: moment(to).valueOf(), filterIndex: 5 })}
                        />

                    </div>

                </Navigation>
                <div className={statisticsTheme.subNav}>
                    <div>
                        <Button
                            className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: tabIndex === 0 })}
                            primary={tabIndex === 0}
                            icon='donut_large'
                            label={t('CHARTS')}
                            onClick={() => this.handleTabChange(0)}
                        />
                        <Button
                            className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: tabIndex === 1 })}
                            primary={tabIndex === 1}
                            icon='list'
                            label={t('TABLE')}
                            onClick={() => this.handleTabChange(1)}
                        />
                    </div>
                    <div>
                        {moment(this.state.start).format() + ' - ' + moment(this.state.end).format()}
                    </div>
                </div>
                <br />

                {this.props.spinner ?
                    <div style={{ textAlign: 'center' }}>
                        <ProgressBar type='circular' mode='indeterminate' multicolor />
                    </div>
                    :

                    <div>
                        {this.state.tabIndex === 0 ?
                            Object.keys(this.state.statistics).length ?
                                this.renderBidsPeriodStatistics({ stats: this.state.statistics })
                                : t('NOTHING_TO_SHOW')

                            : null
                        }

                        {this.state.tabIndex === 1 ?
                            Object.keys(this.state.statistics).length && Object.keys(this.state.bidsStats).length ?
                                this.renderBidsTable({ bids: this.state.bidsStats })
                                : t('NOTHING_TO_SHOW')
                            : null
                        }
                    </div>
                }
            </div>
        )
    }
}

BidsStatistics.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    bids: PropTypes.array.isRequired,
    onSave: PropTypes.func.isRequired
}

function mapStateToProps(state, props) {
    const persist = state.persist
    const memory = state.memory
    return {
        account: persist.account,
        bidsById: persist.bids.bidsById,
        side: memory.nav.side,
        transactions: persist.web3Transactions[persist.account._addr] || {},
        spinner: memory.spinners[SPINNER_ID],
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

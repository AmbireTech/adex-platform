import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import datepickerTheme from './datepicker.css'
import statisticsTheme from './bidsStatisticsTheme.css'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { BidsStatusBars, BidsStatusPie, BidsTimeStatistics } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { exchange as ExchangeConstants } from 'adex-constants'
import { getBidEvents } from 'services/adex-node/actions'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import Navigation from 'react-toolbox/lib/navigation'
import moment from 'moment'
import Dropdown from 'components/common/dropdown'
// import ItemsList from './ItemsList'
import ListWithControls from 'components/dashboard/containers/Lists/ListWithControls'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS } from 'constants/misc'
import { CommonTableRowStats, renderTableHeadStats, searchMatch, getBidData } from './BidsCommon'
import Rows from 'components/dashboard/collection/Rows'
import classnames from 'classnames'
import DatePicker from 'react-toolbox/lib/date_picker'
import FontIcon from 'react-toolbox/lib/font_icon'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import CsvDownloadBtn from 'components/common/csv_dl_btn/CsvDownloadBtn'
import { adxToFloatView } from 'services/smart-contracts/utils'
import { Card } from 'react-toolbox/lib/card'
import { intervalsMs, DATETIME_EXPORT_FORMAT } from 'helpers/timeHelpers'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const { BidStatesLabels } = ExchangeConstants
const SPINNER_ID = 'STATISTICS'

const MAX_STATS_INTERVAL = 3 * 31 * 24 * 60 * 60 * 1000 // 93 days

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
            currentPeriodLabel: null,
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
        this.applyPeriodFilter({ start: intervalsMs.last24Hours.start, end: intervalsMs.last24Hours.end, filterIndex: 0, label: 'LABEL_LAST_24H' })
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
                dayKey = time.format('DD MMMM YYYY')
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

    chartActions = ({ btnID, stats, fileName }) => {
        return (
            <div className={statisticsTheme.chartActions}>
                {stats ?
                    <CsvDownloadBtn getData={() => {
                        return this.getChartCsvData({ stats: stats })
                    }} fileName={fileName} />
                    : null}

                <IconButton
                    onClick={() => this.toggleFullWidthChart(btnID)}
                >
                    {this.isInFullWidthChart(btnID) ? <FullscreenIcon /> : <FullscreenExitIcon />}
                </IconButton>
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

    getChartCsvData = ({ stats }) => {
        const t = this.props.t
        const csvData = [[t('CSV_COL_TIME_INTERVAL'), t('CSV_COL_UNIQUE_CLICKS'), t('CSV_COL_CLICKS'), t('CSV_COL_IMPRESSIONS')]]
        Object.keys(stats.intervalStats).forEach(key => {
            const rowStats = stats.intervalStats[key]
            const row = [moment(parseInt(key, 10) * stats.interval).format(DATETIME_EXPORT_FORMAT), rowStats.uniqueClick, rowStats.clicks, rowStats.loaded]
            csvData.push(row)
        })

        return csvData
    }

    getExportFileName = ({ intervalType = '' }) => {
        return 'adex_export_' + intervalType + '_' + moment(this.state.start).format('YYYY_MM_DD') + '_' + moment(this.state.end).format('YYYY_MM_DD')
    }

    // TODO: Separate components for different charts
    renderBidsPeriodStatistics = ({ stats }) => {
        const data = this.bidsStatsData({ stats: stats })
        const t = this.props.t
        const hourlyDataValue = this.state.hourlyDaySelected || Object.keys(data.hourly)[0]
        return (
            <div>
                <Grid fluid >
                    <Row top='xs' className={theme.itemsListControls}>
                        {Object.keys(data.live).length ?
                            <this.resizableCol id='LIVE_CHART' >
                                <Card raised className={statisticsTheme.chartCard}>
                                    <this.chartActions
                                        btnID='LIVE_CHART'
                                        stats={stats.live}
                                        fileName={this.getExportFileName({ intervalType: 'live' })}
                                    />
                                    <BidsTimeStatistics data={data.live} t={t} options={{ title: t('CHART_LIVE_TITLE'), col: this.isInFullWidthChart('LIVE_CHART') ? 12 : 6 }} />
                                </Card>
                            </this.resizableCol >
                            : null}
                        {Object.keys(data.hourly).length ?
                            <this.resizableCol id='HOURLY_CHART' >
                                <Card raised className={statisticsTheme.chartCard}>
                                    <Dropdown
                                        source={Object.keys(data.hourly).map((key) => { return { value: key, label: key } })}
                                        onChange={(val) => this.setState({ hourlyDaySelected: val })}
                                        label={t('LABEL_DD_SELECT_DAY')}
                                        value={hourlyDataValue}
                                        htmlId='hourly-date-dd'
                                        name='hourlyDataValue'
                                    />
                                    <this.chartActions
                                        btnID='HOURLY_CHART'
                                        stats={stats.hourly}
                                        fileName={this.getExportFileName({ intervalType: 'hourly' })}
                                    />
                                    {Object.keys(data.hourly).map((key, index) => {
                                        return (
                                            <div key={key} style={{ display: (this.state.hourlyDaySelected === key) || (!this.state.hourlyDaySelected && index === 0) ? 'block' : 'none' }}>
                                                <BidsTimeStatistics data={data.hourly[key]} t={t} options={{ title: t('CHART_HOURLY_TITLE', { args: ['(' + key + ')'] }), col: this.isInFullWidthChart('HOURLY_CHART') ? 12 : 6 }} />
                                            </div>
                                        )
                                    })}
                                </Card>
                            </this.resizableCol >
                            : null}
                        {Object.keys(data.daily).length ?

                            <this.resizableCol id='DAILY_CHART' >
                                <Card raised className={statisticsTheme.chartCard}>
                                    <this.chartActions
                                        btnID='DAILY_CHART'
                                        stats={stats.daily}
                                        fileName={this.getExportFileName({ intervalType: 'daily' })}
                                    />
                                    <BidsTimeStatistics data={data.daily} t={t} options={{ title: t('CHART_DAILY_TITLE'), col: this.isInFullWidthChart('DAILY_CHART') ? 12 : 6 }} />
                                </Card>
                            </this.resizableCol >

                            : null}
                    </Row>
                </Grid>
            </div>
        )
    }

    // TODO: Make common funcs, fix the statistics
    renderTableRow(bid, index, { to, selected }) {

        let t = this.props.t

        // console.log('bidAllData', bidAllData)

        const bidData = getBidData({
            bid: bid,
            t: t,
            transactions: this.props.transactions,
            side: this.props.side,
            item: this.props.item,
            account: this.props.account,
            onSave: this.props.onSave
        })

        // console.log('bidData', bidData)

        return <CommonTableRowStats bidData={bidData} t={t} key={bid._id} />
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

    getTableCsvData = ({ bids = [] }) => {
        const t = this.props.t
        const csvData = [
            [moment(this.state.start).format('YYYY/MM/DD') + '-' + moment(this.state.end).format('YYYY/MM/DD')],

            [t('BID_ID'),
            t('BID_AMOUNT') + ' (ADX)',
            t('BID_TARGET'),
            t('BID_UNIQUE_CLICKS'),
            t('BID_STATE'),
            t('BID_PERIOD_UNIQUE_CLICKS'),
            t('BID_PERIOD_CLICKS'),
            t('BID_PERIOD_IMPRESSIONS'),
            t('BID_ESTIMATED_REVENUE'),
            t('TIMEOUT'),
            t('ACCEPTED'),
            t('EXPIRES')]
        ]

        bids.forEach(bid => {

            const statsUniqueClicks = bid.statistics.daily.uniqueClick || 0
            const accepted = (bid._acceptedTime || 0) * 1000
            const timeout = (bid._timeout || 0) * 1000
            const bidExpires = accepted ? (accepted + timeout) : null

            const row = [
                bid._id,
                adxToFloatView(bid._amount),
                bid._target,
                bid.clicksCount || 0,
                t(BidStatesLabels[bid._state]),
                bid.statistics.statsUniqueClicks,
                bid.statistics.daily.clicks || 0,
                bid.statistics.daily.loaded || 0,
                statsUniqueClicks > 0 ?
                    (adxToFloatView(Math.floor(parseInt(bid._amount, 10) / parseInt(bid._target, 10)) * statsUniqueClicks))
                    : 0,
                moment.duration(timeout, 'ms').humanize(),
                accepted ? moment(accepted).format(DATETIME_EXPORT_FORMAT) : '-',
                bidExpires ? moment(bidExpires).format(DATETIME_EXPORT_FORMAT) : '-'
            ]
            csvData.push(row)
        })

        return csvData
    }


    renderBidsTable = ({ bids }) => {
        let allBidsData = Object.keys(bids).reduce((memo, key) => {
            const statistics = { ...bids[key] }
            const bid = { ...this.props.bidsById[key] }

            if (!bid) {
                return memo
            }

            bid.statistics = {
                live: statistics.live,
                hourly: statistics.hourly,
                daily: statistics.daily,
            }

            memo.push(bid)

            return memo
        }, [])

        return (
            <div>
                <CsvDownloadBtn getData={() => {
                    return this.getTableCsvData({ bids: allBidsData })
                }} fileName={this.getExportFileName({ intervalType: 'by_bid' })} />
                <ListWithControls
                    items={allBidsData}
                    listMode='rows'
                    renderRows={this.renderRows.bind(this)}
                    sortProperties={SORT_PROPERTIES_BIDS}
                    searchMatch={searchMatch}
                    filterProperties={FILTER_PROPERTIES_BIDS}
                />
            </div>
        )
    }

    applyPeriodFilter = ({ start, end, filterIndex, label }) => {
        this.props.actions.updateSpinner(SPINNER_ID, true)
        this.setState({ filterIndex, hourlyDaySelected: '', start, end, currentPeriodLabel: label })
        this.getBids({ start, end })
    }

    render() {
        const { t, classes } = this.props
        const filterIndex = this.state.filterIndex
        const tabIndex = this.state.tabIndex
        let from = this.state.from ? new Date(this.state.from) : null
        let to = this.state.to ? new Date(this.state.to) : null
        let now = new Date()
        const startLabel = moment(this.state.start).format('DD MMMM YYYY')
        const endLabel = moment(this.state.end).format('DD MMMM YYYY')
        const hastStatisticsForPeriod = Object.keys(this.state.statistics).length
        const periodLabel = t('FORMAT_PERIOD', { args: [startLabel, endLabel] })

        const fromMs = from ? from.valueOf() : 0
        const toMs = to ? to.valueOf() : 0

        //TODO: Add some info about this on the UI
        const intervalErr = toMs - fromMs > MAX_STATS_INTERVAL
        return (
            <div>
                <div
                    className={classes.horizontal}
                >
                    <div
                        className={classes.navLeft}
                    >
                        <div>
                            <Button
                                color='primary'
                                className={classnames(classes.navButton, { [classes.active]: filterIndex === 0 })}
                                onClick={() => this.applyPeriodFilter({ start: intervalsMs.last24Hours.start, end: intervalsMs.last24Hours.end, filterIndex: 0, label: 'LABEL_LAST_24H' })}
                            >
                                {t('LABEL_LAST_24H')}
                            </Button>

                            <Button
                                color='primary'
                                className={classnames(classes.navButton, { [classes.active]: filterIndex === 1 })}
                                onClick={() => this.applyPeriodFilter({ start: intervalsMs.thisWeek.start, end: intervalsMs.thisWeek.end, filterIndex: 1, label: 'LABEL_THIS_WEEK' })}
                            >
                                {t('LABEL_THIS_WEEK')}
                            </Button>

                            <Button
                                color='primary'
                                className={classnames(classes.navButton, { [classes.active]: filterIndex === 2 })}
                                onClick={() => this.applyPeriodFilter({ start: intervalsMs.lastWeek.start, end: intervalsMs.lastWeek.end, filterIndex: 2, label: 'LABEL_LAST_WEEK' })}
                            >
                                {t('LABEL_LAST_WEEK')}
                            </Button>

                            <Button
                                color='primary'
                                className={classnames(classes.navButton, { [classes.active]: filterIndex === 3 })}
                                onClick={() => this.applyPeriodFilter({ start: intervalsMs.thisMonth.start, end: intervalsMs.thisMonth.end, filterIndex: 3, label: 'LABEL_THIS_MONTH' })}
                            >
                                {t('LABEL_THIS_MONTH')}
                            </Button>

                            <Button
                                color='primary'
                                className={classnames(classes.navButton, { [classes.active]: filterIndex === 4 })}
                                onClick={() => this.applyPeriodFilter({ start: intervalsMs.lastMonth.start, end: intervalsMs.lastMonth.end, filterIndex: 4, label: 'LABEL_LAST_MONTH' })}
                            >
                                {t('LABEL_LAST_MONTH')}
                            </Button>
                        </div>
                    </div>
                    <div
                        className={classnames(classes.navRight, datepickerTheme.statsDatePicker, { [datepickerTheme.active]: filterIndex === 5 })}

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
                            // inverse
                            // variant='raised'
                            disabled={intervalErr}
                            onClick={() => this.applyPeriodFilter({ start: moment(from).valueOf(), end: moment(to).valueOf(), filterIndex: 5 })}
                        >
                            {t('APPLY')}
                        </Button>

                    </div>

                </div>
                <div className={statisticsTheme.subNav}>
                    <div>
                        <Button
                            // className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: tabIndex === 0 })}
                            color={tabIndex === 0 ? 'primary' : null}
                            icon='donut_large'
                            onClick={() => this.handleTabChange(0)}
                        >
                            {t('CHARTS')}
                        </Button>
                        <Button
                            // className={classnames(statisticsTheme.navButton, { [statisticsTheme.active]: tabIndex === 1 })}
                            color={tabIndex === 1 ? 'primary' : null}
                            icon='list'
                            onClick={() => this.handleTabChange(1)}
                        >
                            {t('TABLE')}
                        </Button>
                    </div>
                    <div>
                        {!this.props.spinner ?
                            <div>
                                {hastStatisticsForPeriod ?
                                    <strong className={statisticsTheme.dataLabel}> {t('SHOW_FOR_PERIOD', { args: [t(this.state.currentPeriodLabel) || periodLabel] })} </strong>
                                    :
                                    <strong className={statisticsTheme.noDataLabel}> {t('NOTHING_TO_SHOW_FOR_PERIOD', { args: [t(this.state.currentPeriodLabel) || periodLabel] })} </strong>}
                                {!!this.state.currentPeriodLabel ?
                                    <small> ({periodLabel}) </small>
                                    : null
                                }
                            </div>
                            : null
                        }
                    </div>
                </div>
                <br />

                {this.props.spinner ?
                    <div style={{ textAlign: 'center' }}>
                        <ProgressBar type='circular' mode='indeterminate' multicolor />
                    </div>
                    :

                    <div>
                        {hastStatisticsForPeriod && this.state.tabIndex === 0 ?
                            this.renderBidsPeriodStatistics({ stats: this.state.statistics })
                            : null}

                        {hastStatisticsForPeriod && this.state.tabIndex === 1 ?
                            this.renderBidsTable({ bids: this.state.bidsStats })
                            : null}
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
)(withStyles(styles)(Translate(BidsStatistics)))

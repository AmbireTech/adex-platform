import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
	Visibility,
	MonetizationOn,
	Mouse,
	Equalizer,
} from '@material-ui/icons'
import { Box } from '@material-ui/core'
import { SimpleStatistics } from 'components/dashboard/charts/simplified'
import Dropdown from 'components/common/dropdown'
import { VALIDATOR_ANALYTICS_TIMEFRAMES } from 'constants/misc'
import StatsCard from './StatsCard'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import DateTimePicker from 'components/common/DateTimePicker'
import { PeriodDatePicker, DatePicker } from 'components/common/DatePicker'
import { ALEX_GREY } from 'components/App/themeMUi'
import { styles } from './styles'
import { formatNumberWithCommas } from 'helpers/formatters'
import {
	execute,
	updateIdSideAnalyticsChartTimeframe,
	updateIdSideAnalyticsChartPeriod,
	updateAnalyticsPeriodPrevNextLive,
	updateAccountAnalyticsThrottled,
} from 'actions'
import {
	t,
	selectTotalImpressions,
	selectTotalMoney,
	selectAverageCPM,
	selectMainToken,
	selectIdentitySideAnalyticsTimeframe,
	selectIdentitySideAnalyticsPeriod,
	selectTotalClicks,
	selectChartDatapointsCPM,
	selectChartDatapointsImpressions,
	selectChartDatapointsClicks,
	selectChartDatapointsPayouts,
	selectSide,
	selectAnalyticsDataSide,
	selectAuth,
	selectInitialDataLoadedByData,
	// selectMissingRevenueDataPointsAccepted,
	selectAnalyticsMinAndMaxDates,
} from 'selectors'
import dateUtils from 'helpers/dateUtils'
import { useKeyPress } from 'hooks/useKeyPress'
import { analyticsLoopCustom } from 'services/store-data/analytics'
import {
	getPeriodLabel,
	getPeriodDataPointLabel,
} from 'helpers/analyticsTimeHelpers'

const min = 60 * 1000

const timeoutMap = {
	hour: min,
	day: 10 * min,
	week: 30 * min,
	month: 60 * 2 * min,
	year: 60 * 24 * min,
}

const timeFrames = VALIDATOR_ANALYTICS_TIMEFRAMES.map(tf => {
	const translated = { ...tf }
	translated.label = t(tf.label)
	return translated
})

const getMetrics = theme => ({
	publisher: [
		{
			label: t('LABEL_IMPRESSIONS'),
			value: 'eventCounts',
			color: theme.palette.primary.main,
		},
		{
			label: t('LABEL_CLICKS'),
			value: 'eventCounts',
			color: theme.palette.secondary.main,
		},
		{
			label: t('LABEL_REVENUE'),
			value: 'eventPayouts',
			color: theme.palette.accentTwo.main,
		},
		{
			label: t('PROP_CPM'),
			color: ALEX_GREY,
		},
	],
	advertiser: [
		{
			label: t('LABEL_IMPRESSIONS'),
			value: 'eventCounts',
			color: theme.palette.primary.main,
		},
		{
			label: t('LABEL_CLICKS'),
			value: 'eventCounts',
			color: theme.palette.secondary.main,
		},
		{
			label: t('LABEL_SPEND'),
			value: 'eventPayouts',
			color: theme.palette.accentOne.main,
		},
		{
			label: t('PROP_CPM'),
			color: ALEX_GREY,
		},
	],
})

const getDefaultLabels = ({ timeframe, start, end }) => [
	getPeriodDataPointLabel({ timeframe, time: start }),
	getPeriodDataPointLabel({ timeframe, time: end }),
]

const DatePickerSwitch = ({ timeframe, period: { start, end }, ...rest }) => {
	switch (timeframe) {
		case 'week':
			return (
				<PeriodDatePicker
					{...rest}
					period='week'
					labelFunc={val => getPeriodLabel({ timeframe, start, end })}
				/>
			)
		case 'day':
			return (
				<DatePicker
					{...rest}
					labelFunc={val => getPeriodLabel({ timeframe, start, end })}
				/>
			)
		case 'hour':
			return (
				<DateTimePicker
					{...rest}
					views={['date', 'hours']}
					roundHour
					minutesStep={60}
					labelFunc={val => getPeriodLabel({ timeframe, start, end })}
				/>
			)
		case 'month':
			return (
				<PeriodDatePicker
					{...rest}
					period='month'
					labelFunc={val => getPeriodLabel({ timeframe, start, end })}
				/>
			)
		case 'year':
			return (
				<DatePicker
					{...rest}
					views={['year', 'month']}
					maxDate={dateUtils.addMonths(dateUtils.date(), -11)}
					labelFunc={val => getPeriodLabel({ timeframe, start, end })}
				/>
			)
		default:
			return <DatePicker {...rest} />
	}
}
const useStyles = makeStyles(styles)

export function BasicStats() {
	const theme = useTheme()
	const classes = useStyles()
	const SPACE = useKeyPress(' ')
	const ARROW_LEFT = useKeyPress('ArrowLeft')
	const ARROW_RIGHT = useKeyPress('ArrowRight')
	const { symbol } = useSelector(selectMainToken)
	const isAuth = useSelector(state => selectAuth(state))
	const { start, end } = useSelector(selectIdentitySideAnalyticsPeriod)
	const timeframe = useSelector(selectIdentitySideAnalyticsTimeframe)
	const uiSide = useSelector(selectSide)
	// NOTE: side can be: for-publisher, for-advertiser or current campaign in details Id
	const side = useSelector(selectAnalyticsDataSide)
	const { minDate, maxDate } = useSelector(selectAnalyticsMinAndMaxDates)
	const [loop, setLoop] = useState()
	const [metrics, setMetrics] = useState(null)
	const allChannelsLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'allChannels')
	)
	const advAnalyticsLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'advancedAnalytics')
	)
	const itemsLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'allItems')
	)
	const initialDataLoaded =
		allChannelsLoaded && advAnalyticsLoaded && itemsLoaded
	const [data1Active, setData1Active] = useState(true)
	const [data2Active, setData2Active] = useState(true)
	const [data3Active, setData3Active] = useState(true)
	const [data4Active, setData4Active] = useState(true)

	const defaultLabels = getDefaultLabels({ timeframe, start, end })

	const totalImpressions = useSelector(state =>
		selectTotalImpressions(state, {
			side,
			timeframe,
		})
	)

	const totalClicks = useSelector(state =>
		selectTotalClicks(state, {
			side,
			timeframe,
		})
	)

	const totalMoney = useSelector(state =>
		selectTotalMoney(state, {
			side,
			timeframe,
		})
	)

	const averageCPM = useSelector(state =>
		selectAverageCPM(state, {
			side,
			timeframe,
		})
	)

	const payouts = useSelector(state =>
		selectChartDatapointsPayouts(state, { side, timeframe })
	)

	const impressions = useSelector(state =>
		selectChartDatapointsImpressions(state, { side, timeframe })
	)

	const clicks = useSelector(state =>
		selectChartDatapointsClicks(state, { side, timeframe })
	)

	const cpm = useSelector(state =>
		selectChartDatapointsCPM(state, { side, timeframe })
	)

	const goNext = () => {
		execute(updateAnalyticsPeriodPrevNextLive({ next: true }))
	}

	const goPrev = () => {
		execute(updateAnalyticsPeriodPrevNextLive({ next: false }))
	}

	const goLive = () => {
		execute(updateAnalyticsPeriodPrevNextLive({ live: true }))
	}

	useEffect(() => {
		setMetrics(getMetrics(theme))
	}, [theme])

	useEffect(() => {
		SPACE && goLive()
		ARROW_RIGHT && goNext()
		ARROW_LEFT && goPrev()
	}, [ARROW_LEFT, ARROW_RIGHT, SPACE])

	useEffect(() => {
		if (initialDataLoaded && side && timeframe && start) {
			execute(updateAccountAnalyticsThrottled())
		}
	}, [initialDataLoaded, side, timeframe, start])

	useEffect(() => {
		if (initialDataLoaded && side) {
			goLive()
		}
	}, [initialDataLoaded, side])

	useEffect(() => {
		initialDataLoaded && loop && loop.start()
		return () => {
			loop && loop.stop()
		}
	}, [initialDataLoaded, loop])

	useEffect(() => {
		loop && loop.stop()
		setLoop(
			analyticsLoopCustom({
				timeout: timeoutMap[timeframe],
				syncAction: async () => {
					setTimeout(
						async () =>
							isAuth && (await execute(updateAccountAnalyticsThrottled())),
						timeoutMap[timeframe] -
							(Date.now() % timeoutMap[timeframe]) +
							5 * 1000
					)
				},
			})
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeframe, isAuth])

	const dataSynced =
		!!initialDataLoaded &&
		[
			impressions.labels[impressions.labels.length - 1],
			payouts.labels[payouts.labels.length - 1],
		].every(x => !!x && x === clicks.labels[clicks.labels.length - 1]) &&
		[totalImpressions, totalMoney, averageCPM, totalClicks].every(
			x => x !== null
		)

	return (
		uiSide &&
		metrics && (
			<Box>
				<Box
					display='flex'
					flexDirection='row'
					flexWrap='wrap'
					alignItems='stretch'
				>
					<Box
						display='flex'
						flexDirection='row'
						flexWrap='wrap'
						flexGrow={1}
						alignItems='start'
					>
						<Box m={1} ml={0} flexGrow='1'>
							<Dropdown
								fullWidth
								variant='outlined'
								label={t('SELECT_TIMEFRAME')}
								// helperText={t(timeHints[timeframe])}
								onChange={val => {
									//TODO: fix change of timeframe, set default period as well
									execute(updateIdSideAnalyticsChartTimeframe(val))
								}}
								source={timeFrames}
								value={timeframe}
								htmlId='timeframe-select'
							/>
						</Box>
						<Box m={1} ml={0} flexGrow='1'>
							<DatePickerSwitch
								period={{ start, end }}
								timeframe={timeframe}
								value={start}
								minutesStep={60}
								onChange={val => {
									execute(updateIdSideAnalyticsChartPeriod(val))
								}}
								InputProps={{ multiline: true, className: classes.datePicker }}
								disableFuture
								inputVariant='outlined'
								fullWidth
								calendarIcon
								label={t('ANALYTICS_PERIOD')}
								maxDate={maxDate}
								minDate={minDate}
								// Only when picking future hours as they can't be disabled
								maxDateMessage='' //{t('MAX_DATE_ERROR')}
								minDateMessage='' // we do not need error msgs e.g. for new accounts
								strictCompareDates
								onBackClick={e => {
									e.stopPropagation()
									goPrev()
								}}
								onLiveClick={e => {
									e.stopPropagation()
									goLive()
								}}
								onNextClick={e => {
									e.stopPropagation()
									goNext()
								}}
							/>
						</Box>
					</Box>
					<StatsCard
						bgColor='primary'
						subtitle={t('LABEL_TOTAL_IMPRESSIONS')}
						loading={!dataSynced}
						title={`${formatNumberWithCommas(totalImpressions || 0)}`}
						explain={t('EXPLAIN_TOTAL_IMPRESSIONS')}
						onClick={() => setData1Active(!data1Active)}
						dataVisible={data1Active}
					>
						<Visibility className={classes.cardIcon} />
					</StatsCard>
					<StatsCard
						bgColor='secondary'
						subtitle={t('LABEL_TOTAL_CLICKS')}
						explain={t('EXPLAIN_TOTAL_CLICKS')}
						loading={!dataSynced}
						title={`${formatNumberWithCommas(totalClicks || 0)} (${parseFloat(
							(totalClicks / totalImpressions) * 100 || 0
						).toFixed(2)} % ${t('LABEL_CTR')})`}
						onClick={() => setData2Active(!data2Active)}
						dataVisible={data2Active}
					>
						<Mouse className={classes.cardIcon} />
					</StatsCard>
					{uiSide === 'advertiser' && (
						<StatsCard
							bgColor='accentOne'
							subtitle={t('LABEL_TOTAL_SPENT')}
							explain={t('EXPLAIN_TOTAL_SPENT', { args: [symbol] })}
							title={`~ ${formatNumberWithCommas(
								parseFloat(totalMoney || 0).toFixed(2)
							)} ${symbol}`}
							loading={!dataSynced}
							onClick={() => setData3Active(!data3Active)}
							dataVisible={data3Active}
						>
							<MonetizationOn className={classes.cardIcon} />
						</StatsCard>
					)}

					{uiSide === 'publisher' && (
						<StatsCard
							bgColor='accentTwo'
							subtitle={t('LABEL_TOTAL_REVENUE')}
							explain={t('EXPLAIN_TOTAL_REVENUE')}
							title={`~ ${formatNumberWithCommas(
								parseFloat(totalMoney || 0).toFixed(2)
							)} ${symbol}`}
							loading={!dataSynced}
							onClick={() => setData3Active(!data3Active)}
							dataVisible={data3Active}
						>
							<MonetizationOn className={classes.cardIcon} />
						</StatsCard>
					)}
					<StatsCard
						bgColor='grey'
						subtitle={t('LABEL_AVG_CPM')}
						explain={t('EXPLAIN_AVG_CPM')}
						loading={!dataSynced}
						title={`~ ${formatNumberWithCommas(
							parseFloat(averageCPM || 0).toFixed(2)
						)} ${symbol} / CPM`}
						onClick={() => setData4Active(!data4Active)}
						dataVisible={data4Active}
					>
						<Equalizer className={classes.cardIcon} />
					</StatsCard>
				</Box>

				<Box mt={1}>
					<SimpleStatistics
						start={start}
						end={end}
						timeframe={timeframe}
						options={{
							title:
								(timeFrames.find(a => a.value === timeframe) || {}).label || '',
						}}
						defaultLabels={defaultLabels}
						data1={impressions}
						data2={clicks}
						data3={payouts}
						data4={cpm}
						data1Active={data1Active}
						data2Active={data2Active}
						data3Active={data3Active}
						data4Active={data4Active}
						dataSynced={dataSynced}
						y1Label={metrics[uiSide][0].label}
						y1Color={metrics[uiSide][0].color}
						y2Label={metrics[uiSide][1].label}
						y2Color={metrics[uiSide][1].color}
						y3Label={metrics[uiSide][2].label}
						y3Color={metrics[uiSide][2].color}
						y4Label={metrics[uiSide][3].label}
						y4Color={metrics[uiSide][3].color}
					/>
				</Box>
			</Box>
		)
	)
}

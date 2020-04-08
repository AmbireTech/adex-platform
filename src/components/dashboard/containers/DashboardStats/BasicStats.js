import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
	execute,
	updateAnalyticsTimeframe,
	updateAnalyticsPeriod,
	updateAnalyticsPeriodPrevNextLive,
} from 'actions'
import { SimpleStatistics } from 'components/dashboard/charts/simplified'
import Dropdown from 'components/common/dropdown'
import Grid from '@material-ui/core/Grid'
import { VALIDATOR_ANALYTICS_TIMEFRAMES } from 'constants/misc'
import StatsCard from './StatsCard'
import { makeStyles } from '@material-ui/core/styles'
import DateTimePicker from 'components/common/DateTimePicker'
import { WeeklyDatePicker, DatePicker } from 'components/common/DatePicker'
import {
	Visibility,
	MonetizationOn,
	Mouse,
	Equalizer,
} from '@material-ui/icons'
import { Box } from '@material-ui/core'
import {
	PRIMARY,
	SECONDARY,
	ACCENT_ONE,
	ACCENT_TWO,
	ALEX_GREY,
} from 'components/App/themeMUi'
import { styles } from './styles'
import { formatNumberWithCommas } from 'helpers/formatters'
import {
	t,
	selectTotalImpressions,
	selectTotalMoney,
	selectAverageCPM,
	selectMainToken,
	selectAnalyticsTimeframe,
	selectTotalClicks,
	selectChartDatapointsCPM,
	selectChartDatapointsImpressions,
	selectChartDatapointsClicks,
	selectChartDatapointsPayouts,
	selectAnalyticsPeriod,
} from 'selectors'
import dateUtils from 'helpers/dateUtils'
import { useKeyPress } from 'hooks/useKeyPress'

const timeFrames = VALIDATOR_ANALYTICS_TIMEFRAMES.map(tf => {
	const translated = { ...tf }
	translated.label = t(tf.label)
	return translated
})

const metrics = {
	publisher: [
		{
			label: t('LABEL_REVENUE'),
			value: 'eventPayouts',
			color: ACCENT_TWO,
		},
		{
			label: t('LABEL_IMPRESSIONS'),
			value: 'eventCounts',
			color: PRIMARY,
		},
		{
			label: t('LABEL_CLICKS'),
			value: 'eventCounts',
			color: SECONDARY,
		},
		{
			label: t('PROP_CPM'),
			color: ALEX_GREY,
		},
	],
	advertiser: [
		{
			label: t('LABEL_SPEND'),
			value: 'eventPayouts',
			color: ACCENT_ONE,
		},
		{
			label: t('LABEL_IMPRESSIONS'),
			value: 'eventCounts',
			color: PRIMARY,
		},
		{
			label: t('LABEL_CLICKS'),
			value: 'eventCounts',
			color: SECONDARY,
		},
		{
			label: t('PROP_CPM'),
			color: ALEX_GREY,
		},
	],
}

const timeHints = {
	hour: 'SHOWING_LAST_HOUR',
	day: 'SHOWING_LAST_24_HOURS',
	week: 'SHOWING_LAST_7_DAYS',
}

const DatePickerSwitch = ({ timeframe, ...rest }) => {
	switch (timeframe) {
		case 'week':
			return <WeeklyDatePicker {...rest} />
		case 'day':
			return (
				<DatePicker
					labelFunc={val =>
						dateUtils.format(dateUtils.date(val), 'MMM Do, YYYY')
					}
					{...rest}
				/>
			)
		case 'hour':
			return (
				<DateTimePicker
					views={['date', 'hours']}
					roundHour
					minutesStep={60}
					labelFunc={val =>
						`${dateUtils.format(
							dateUtils.date(val),
							'MMM Do, YYYY - (HH:mm'
						)} - ${dateUtils.format(
							dateUtils.setMinutes(dateUtils.date(val), 59),
							'HH:mm)'
						)}`
					}
					{...rest}
				/>
			)
		default:
			return <DatePicker {...rest} />
	}
}

export function BasicStats({ side }) {
	const useStyles = makeStyles(styles)
	const classes = useStyles()
	const SPACE = useKeyPress(' ')
	const ARROW_LEFT = useKeyPress('ArrowLeft')
	const ARROW_RIGHT = useKeyPress('ArrowRight')
	const { symbol } = useSelector(selectMainToken)
	const { start } = useSelector(selectAnalyticsPeriod)
	const timeframe = useSelector(selectAnalyticsTimeframe)
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

	const loadingImpressions = totalImpressions === null
	const loadingMoney = totalMoney === null
	const loadingCPM = averageCPM === null
	const loadingClicks = totalClicks === null

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

	useEffect(() => {
		SPACE && execute(updateAnalyticsPeriodPrevNextLive({ live: true }))
		ARROW_RIGHT && execute(updateAnalyticsPeriodPrevNextLive({ next: true }))
		ARROW_LEFT && execute(updateAnalyticsPeriodPrevNextLive({ next: false }))
	}, [ARROW_LEFT, ARROW_RIGHT, SPACE])

	useEffect(() => {
		execute(updateAnalyticsPeriodPrevNextLive({ live: true }))
	}, [side])

	const dataInSync =
		(clicks.labels[clicks.labels.length - 1] ===
			impressions[impressions.labels.length - 1]) ===
		payouts[payouts.labels.length - 1]
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<div className={classes.infoStatsContainer}>
					<StatsCard>
						<Box mb={1}>
							<Dropdown
								fullWidth
								label={t('SELECT_TIMEFRAME')}
								// helperText={t(timeHints[timeframe])}
								onChange={val => {
									//TODO: fix change of timeframe, set default period as well
									execute(updateAnalyticsTimeframe(val))
								}}
								source={timeFrames}
								value={timeframe}
								htmlId='timeframe-select'
							/>
						</Box>
						<Box>
							<DatePickerSwitch
								timeframe={timeframe}
								value={start}
								minutesStep={60}
								onChange={val => {
									execute(updateAnalyticsPeriod(val))
								}}
								disableFuture
								fullWidth
								calendarIcon
								label={t('ANALYTICS_PERIOD')}
								max={Date.now()}
								// Only when picking future hours as they can't be disabled
								maxDateMessage={t('MAX_DATE_ERROR')}
								strictCompareDates
								onBackClick={e => {
									e.stopPropagation()
									execute(updateAnalyticsPeriodPrevNextLive({ next: false }))
								}}
								onLiveClick={e => {
									e.stopPropagation()
									execute(updateAnalyticsPeriodPrevNextLive({ live: true }))
								}}
								onNextClick={e => {
									e.stopPropagation()
									execute(updateAnalyticsPeriodPrevNextLive({ next: true }))
								}}
							/>
						</Box>
					</StatsCard>
					<StatsCard
						bgColor='primary'
						subtitle={t('LABEL_TOTAL_IMPRESSIONS')}
						loading={loadingImpressions && !dataInSync}
						title={`${formatNumberWithCommas(totalImpressions || 0)}`}
						explain={t('EXPLAIN_TOTAL_IMPRESSIONS')}
					>
						<Visibility className={classes.cardIcon} />
					</StatsCard>
					<StatsCard
						bgColor='secondary'
						subtitle={t('LABEL_TOTAL_CLICKS')}
						explain={t('EXPLAIN_TOTAL_CLICKS')}
						loading={
							loadingClicks &&
							loadingImpressions &&
							!dataInSync &&
							totalClicks / totalImpressions !== Infinity
						}
						title={`${formatNumberWithCommas(totalClicks || 0)} (${parseFloat(
							(totalClicks / totalImpressions) * 100 || 0
						).toFixed(2)} % ${t('LABEL_CTR')})`}
					>
						<Mouse className={classes.cardIcon} />
					</StatsCard>
					{side === 'advertiser' && (
						<StatsCard
							bgColor='accentOne'
							subtitle={t('LABEL_TOTAL_SPENT')}
							explain={t('EXPLAIN_TOTAL_SPENT', { args: [symbol] })}
							title={`~ ${formatNumberWithCommas(
								parseFloat(totalMoney || 0).toFixed(2)
							)} ${symbol}`}
							loading={loadingMoney && !dataInSync}
						>
							<MonetizationOn className={classes.cardIcon} />
						</StatsCard>
					)}

					{side === 'publisher' && (
						<StatsCard
							bgColor='accentTwo'
							subtitle={t('LABEL_TOTAL_REVENUE')}
							explain={t('EXPLAIN_TOTAL_REVENUE')}
							title={`~ ${formatNumberWithCommas(
								parseFloat(totalMoney || 0).toFixed(2)
							)} ${symbol}`}
							loading={loadingMoney && !dataInSync}
						>
							<MonetizationOn className={classes.cardIcon} />
						</StatsCard>
					)}
					<StatsCard
						bgColor='grey'
						subtitle={t('LABEL_AVG_CPM')}
						explain={t('EXPLAIN_AVG_CPM')}
						loading={loadingCPM && !dataInSync}
						title={`~ ${formatNumberWithCommas(
							parseFloat(averageCPM || 0).toFixed(2)
						)} ${symbol} / CPM`}
					>
						<Equalizer className={classes.cardIcon} />
					</StatsCard>
				</div>
			</Grid>
			<Grid item xs={12}>
				<SimpleStatistics
					side={side}
					timeframe={timeframe}
					options={{
						title:
							(timeFrames.find(a => a.value === timeframe) || {}).label || '',
					}}
					payouts={payouts}
					impressions={impressions}
					clicks={clicks}
					cpm={cpm}
					y1Label={metrics[side][0].label}
					y1Color={metrics[side][0].color}
					y2Label={metrics[side][1].label}
					y2Color={metrics[side][1].color}
					y3Label={metrics[side][2].label}
					y3Color={metrics[side][2].color}
					y4Label={metrics[side][3].label}
					y4Color={metrics[side][3].color}
					t={t}
				/>
			</Grid>
		</Grid>
	)
}

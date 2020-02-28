import React from 'react'
import { useSelector } from 'react-redux'
import { execute, updateAnalyticsTimeframe } from 'actions'
import { SimpleStatistics } from 'components/dashboard/charts/simplified'
import Dropdown from 'components/common/dropdown'
import Grid from '@material-ui/core/Grid'
import { VALIDATOR_ANALYTICS_TIMEFRAMES } from 'constants/misc'
import StatsCard from './StatsCard'
import { makeStyles } from '@material-ui/core/styles'
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
	selectAnalytics,
	selectTotalClicks,
	selectStatsChartData,
	selectChartDatapointsCPM,
} from 'selectors'

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
			label: t('LABEL_CTR'),
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
			label: t('LABEL_CPM'),
			color: ALEX_GREY,
		},
	],
}

const timeHints = {
	hour: 'SHOWING_LAST_HOUR',
	day: 'SHOWING_LAST_24_HOURS',
	week: 'SHOWING_LAST_7_DAYS',
}

export function BasicStats({ side }) {
	const useStyles = makeStyles(styles)
	const classes = useStyles()
	const { symbol } = useSelector(selectMainToken)

	const timeframe = useSelector(selectAnalytics).timeframe || ''
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
		selectStatsChartData(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventPayouts',
			noLastOne: true,
		})
	)

	const impressions = useSelector(state =>
		selectStatsChartData(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventCounts',
			noLastOne: true,
		})
	)

	const clicks = useSelector(state =>
		selectStatsChartData(state, {
			side,
			timeframe,
			eventType: 'CLICK',
			metric: 'eventCounts',
			noLastOne: true,
		})
	)

	const cpm = useSelector(state =>
		selectChartDatapointsCPM(state, { side, timeframe })
	)

	const dataInSync =
		(clicks.labels[clicks.labels.length - 1] ===
			impressions[impressions.labels.length - 1]) ===
		payouts[payouts.labels.length - 1]
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<div className={classes.infoStatsContainer}>
					<StatsCard>
						<Dropdown
							fullWidth
							label={t('SELECT_TIMEFRAME')}
							helperText={t(timeHints[timeframe])}
							onChange={val => execute(updateAnalyticsTimeframe(val))}
							source={timeFrames}
							value={timeframe}
							htmlId='timeframe-select'
						/>
					</StatsCard>
					<StatsCard
						bgColor='primary'
						subtitle={t('LABEL_TOTAL_IMPRESSIONS')}
						loading={loadingImpressions && !dataInSync}
						title={`${formatNumberWithCommas(totalImpressions || 0)}`}
						explain={t('EXPLAIN_TOTAL_IMPRESSIONS')}
					></StatsCard>
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
						).toFixed(2)}% ${t('LABEL_CTR')})`}
					></StatsCard>
					{side === 'advertiser' && (
						<StatsCard
							bgColor='accentOne'
							subtitle={t('LABEL_TOTAL_SPENT')}
							explain={t('EXPLAIN_TOTAL_SPENT', { args: [symbol] })}
							title={`~ ${formatNumberWithCommas(
								parseFloat(totalMoney || 0).toFixed(2)
							)} ${symbol}`}
							loading={loadingMoney && !dataInSync}
						></StatsCard>
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
						></StatsCard>
					)}
					<StatsCard
						bgColor='grey'
						subtitle={t('LABEL_AVG_CPM')}
						explain={t('EXPLAIN_AVG_CPM')}
						loading={loadingCPM && !dataInSync}
						title={`~ ${formatNumberWithCommas(
							parseFloat(averageCPM || 0).toFixed(2)
						)} ${symbol} / CPM`}
					></StatsCard>
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

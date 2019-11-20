import React, { useState } from 'react'
import { SimpleStatistics } from 'components/dashboard/charts/simplified'
import Dropdown from 'components/common/dropdown'
import Grid from '@material-ui/core/Grid'
import { translate } from 'services/translations/translations'
import { VALIDATOR_ANALYTICS_TIMEFRAMES } from 'constants/misc'
import StatsCard from './StatsCard'
import { makeStyles } from '@material-ui/core/styles'
import { EDDIE_PINK, EDDIE_BLUE, EDDIE_GREEN } from 'components/App/themeMUi'
import { styles } from './styles'
import { formatTokenAmount, formatNumberWithCommas } from 'helpers/formatters'

const timeFrames = VALIDATOR_ANALYTICS_TIMEFRAMES.map(tf => {
	const translated = { ...tf }
	translated.label = translate(tf.label)
	return translated
})

const metrics = {
	publisher: [
		{
			label: translate('LABEL_REVENUE'),
			value: 'eventPayouts',
			color: EDDIE_GREEN,
		},
		{
			label: translate('LABEL_IMPRESSIONS'),
			value: 'eventCounts',
			color: EDDIE_BLUE,
		},
	],
	advertiser: [
		{
			label: translate('LABEL_SPEND'),
			value: 'eventPayouts',
			color: EDDIE_PINK,
		},
		{
			label: translate('LABEL_IMPRESSIONS'),
			value: 'eventCounts',
			color: EDDIE_BLUE,
		},
	],
}

const timeHints = {
	hour: 'SHOWING_LAST_HOUR',
	day: 'SHOWING_LAST_24_HOURS',
	week: 'SHOWING_LAST_7_DAYS',
}

export function BasicStats({ analytics, side, t }) {
	const [timeframe, setTimeframe] = useState(timeFrames[0].value)
	const data = analytics[side] || {}
	const useStyles = makeStyles(styles)
	const classes = useStyles()
	const eventCounts = analytics[side]['IMPRESSION'].eventCounts[timeframe].aggr
	const eventPayouts =
		analytics[side]['IMPRESSION'].eventPayouts[timeframe].aggr
	const totalImpressions = (eventCounts || []).reduce(
		(a, { value }) => a + Number(value) || 0,
		0
	)
	const totalMoney = (eventPayouts || []).reduce(
		(a, { value }) => a + Number(formatTokenAmount(value, 18)) || 0,
		0
	)
	const averageCPM =
		eventCounts && eventPayouts
			? (1000 * Number(totalMoney)) / Number(totalImpressions)
			: 0
	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<div className={classes.infoStatsContainer}>
					<StatsCard>
						<Dropdown
							fullWidth
							label={t('SELECT_TIMEFRAME')}
							helperText={t(timeHints[timeframe])}
							onChange={val => setTimeframe(val)}
							source={timeFrames}
							value={timeframe}
							htmlId='timeframe-select'
						/>
					</StatsCard>
					<StatsCard
						bgColor='eddieBlue'
						subtitle={t('LABEL_TOTAL_IMPRESSIONS')}
						loading={!eventCounts}
						title={`${formatNumberWithCommas(totalImpressions)}`}
						explain={t('EXPLAIN_TOTAL_IMPRESSIONS')}
					></StatsCard>
					{side === 'advertiser' && (
						<StatsCard
							bgColor='eddiePink'
							subtitle={t('LABEL_TOTAL_SPENT')}
							explain={t('EXPLAIN_TOTAL_SPENT')}
							title={`~ ${formatNumberWithCommas(
								parseFloat(totalMoney || 0).toFixed(2)
							)} DAI`}
							loading={!eventPayouts}
						></StatsCard>
					)}

					{side === 'publisher' && (
						<StatsCard
							bgColor='eddieGreen'
							subtitle={t('LABEL_TOTAL_REVENUE')}
							explain={t('EXPLAIN_TOTAL_REVENUE')}
							title={`~ ${formatNumberWithCommas(
								parseFloat(totalMoney || 0).toFixed(2)
							)} DAI`}
							loading={!eventPayouts}
						></StatsCard>
					)}
					<StatsCard
						bgColor='adexGrey'
						subtitle={t('LABEL_AVG_CPM')}
						explain={t('EXPLAIN_AVG_CPM')}
						loading={!eventPayouts || !eventCounts}
						title={`~ ${formatNumberWithCommas(
							parseFloat(averageCPM || 0).toFixed(2)
						)} DAI / CPM`}
					></StatsCard>
				</div>
			</Grid>
			<Grid item xs={12}>
				<SimpleStatistics
					data={data['IMPRESSION']}
					timeframe={timeframe}
					options={{
						title: t(timeFrames.find(a => a.value === timeframe).label),
					}}
					y1Label={metrics[side][0].label}
					y1Color={metrics[side][0].color}
					y2Label={metrics[side][1].label}
					y2Color={metrics[side][1].color}
					eventType={'IMPRESSION'}
					t={t}
				/>
			</Grid>
		</Grid>
	)
}

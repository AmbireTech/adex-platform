import React, { useState } from 'react'
import { SimpleStatistics } from 'components/dashboard/charts/simplified'
import Dropdown from 'components/common/dropdown'
import Grid from '@material-ui/core/Grid'
import { translate } from 'services/translations/translations'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'
import { VALIDATOR_ANALYTICS_TIMEFRAMES } from 'constants/misc'
import StatsCard from './StatsCard'
import { makeStyles } from '@material-ui/core/styles'
import {
	red,
	green,
	blue,
	blueGrey,
	amber,
	brown,
} from '@material-ui/core/colors'
import { styles } from './styles'
import { formatTokenAmount } from 'helpers/formatters'

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
			color: CHARTS_COLORS[3],
		},
		{
			label: translate('LABEL_IMPRESSIONS'),
			value: 'eventCounts',
			color: CHARTS_COLORS[1],
		},
	],
	advertiser: [
		{
			label: translate('LABEL_SPEND'),
			value: 'eventPayouts',
			color: CHARTS_COLORS[2],
		},
		{
			label: translate('LABEL_IMPRESSIONS'),
			value: 'eventCounts',
			color: CHARTS_COLORS[1],
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
	const totalImpressions = (
		analytics[side]['IMPRESSION'].eventCounts[timeframe].aggr || []
	).reduce((a, { value }) => a + Number(value) || 0, 0)
	const totalMoney = formatTokenAmount(
		(analytics[side]['IMPRESSION'].eventPayouts[timeframe].aggr || [])
			.reduce((a, { value }) => a + Number(value) || 0, 0)
			.toString(),
		18,
		true
	)
	const averageCPM =
		totalMoney && totalImpressions ? (1000 * totalMoney) / totalImpressions : 0
	// console.log(totalImpressions)
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={10} lg={10}>
				<div className={classes.infoStatsContainer}>
					<StatsCard
						title={
							<Dropdown
								fullWidth
								label={t('SELECT_TIMEFRAME')}
								onChange={val => setTimeframe(val)}
								source={timeFrames}
								value={timeframe}
								htmlId='timeframe-select'
							/>
						}
						textColor={{ color: 'grey' }}
						subtitleStyle={{ paddingTop: '10px' }}
						explain={t(timeHints[timeframe])}
					></StatsCard>
					<StatsCard
						bgColor={{
							backgroundColor: blue[300],
						}}
						textColor={{ color: 'white' }}
						subtitle={t('LABEL_TOTAL_IMPRESSIONS')}
						loading={!averageCPM}
						title={`${totalImpressions}`}
						explain={t('EXPLAIN_TOTLA_IMPRESSIONS')}
					></StatsCard>
					{side === 'advertiser' && (
						<StatsCard
							bgColor={{
								backgroundColor: red[300],
							}}
							textColor={{ color: 'white' }}
							subtitle={t('LABEL_TOTAL_SPENT')}
							explain={t('EXPLAIN_TOTAL_SPENT')}
							title={`~ ${parseFloat(totalMoney || 0).toFixed(2)} DAI`}
							loading={!averageCPM}
						></StatsCard>
					)}

					{side === 'publisher' && (
						<StatsCard
							bgColor={{
								backgroundColor: green[200],
							}}
							textColor={{ color: 'white' }}
							subtitle={t('LABEL_TOTAL_REVENUE')}
							explain={t('EXPLAIN_TOTAL_REVENUE')}
							title={`~ ${parseFloat(totalMoney || 0).toFixed(2)} DAI`}
							loading={!averageCPM}
						></StatsCard>
					)}
					<StatsCard
						bgColor={{
							backgroundColor: blueGrey[300],
						}}
						textColor={{ color: 'white' }}
						subtitle={t('LABEL_AVG_CPM')}
						explain={t('EXPLAIN_AVG_CPM')}
						loading={!averageCPM}
						title={`~ ${parseFloat(averageCPM || 0).toFixed(2)} DAI / CPM`}
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

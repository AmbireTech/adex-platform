import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { SimpleStatistics } from 'components/dashboard/charts/simplified'
import Dropdown from 'components/common/dropdown'
import Grid from '@material-ui/core/Grid'
import { translate } from 'services/translations/translations'
import { VALIDATOR_ANALYTICS_TIMEFRAMES } from 'constants/misc'
import StatsCard from './StatsCard'
import { makeStyles } from '@material-ui/core/styles'
import { PRIMARY, ACCENT_ONE, ACCENT_TWO } from 'components/App/themeMUi'
import { styles } from './styles'
import { formatNumberWithCommas } from 'helpers/formatters'
import {
	t,
	selectTotalImpressions,
	selectTotalMoney,
	selectAverageCPM,
} from 'selectors'

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
			color: ACCENT_TWO,
		},
		{
			label: translate('LABEL_IMPRESSIONS'),
			value: 'eventCounts',
			color: PRIMARY,
		},
	],
	advertiser: [
		{
			label: translate('LABEL_SPEND'),
			value: 'eventPayouts',
			color: ACCENT_ONE,
		},
		{
			label: translate('LABEL_IMPRESSIONS'),
			value: 'eventCounts',
			color: PRIMARY,
		},
	],
}

const timeHints = {
	hour: 'SHOWING_LAST_HOUR',
	day: 'SHOWING_LAST_24_HOURS',
	week: 'SHOWING_LAST_7_DAYS',
}

export function BasicStats({ side }) {
	const [timeframe, setTimeframe] = useState(timeFrames[1].value)
	const useStyles = makeStyles(styles)
	const classes = useStyles()

	const totalImpressions = useSelector(state =>
		selectTotalImpressions(state, {
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
						bgColor='primary'
						subtitle={t('LABEL_TOTAL_IMPRESSIONS')}
						loading={loadingImpressions}
						title={`${formatNumberWithCommas(totalImpressions || 0)}`}
						explain={t('EXPLAIN_TOTAL_IMPRESSIONS')}
					></StatsCard>
					{side === 'advertiser' && (
						<StatsCard
							bgColor='accentOne'
							subtitle={t('LABEL_TOTAL_SPENT')}
							explain={t('EXPLAIN_TOTAL_SPENT')}
							title={`~ ${formatNumberWithCommas(
								parseFloat(totalMoney || 0).toFixed(2)
							)} SAI`}
							loading={loadingMoney}
						></StatsCard>
					)}

					{side === 'publisher' && (
						<StatsCard
							bgColor='accentTwo'
							subtitle={t('LABEL_TOTAL_REVENUE')}
							explain={t('EXPLAIN_TOTAL_REVENUE')}
							title={`~ ${formatNumberWithCommas(
								parseFloat(totalMoney || 0).toFixed(2)
							)} SAI`}
							loading={loadingMoney}
						></StatsCard>
					)}
					<StatsCard
						bgColor='grey'
						subtitle={t('LABEL_AVG_CPM')}
						explain={t('EXPLAIN_AVG_CPM')}
						loading={loadingCPM}
						title={`~ ${formatNumberWithCommas(
							parseFloat(averageCPM || 0).toFixed(2)
						)} SAI / CPM`}
					></StatsCard>
				</div>
			</Grid>
			<Grid item xs={12}>
				<SimpleStatistics
					side={side}
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

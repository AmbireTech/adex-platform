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

export function BasicStats({ analytics, side, t }) {
	const [timeframe, setTimeframe] = useState(timeFrames[0].value)
	const data = analytics[side] || {}
	const useStyles = makeStyles(styles)
	const classes = useStyles()

	return (
		<Grid container spacing={2}>
			<Grid item xs={6}>
				<div className={classes.infoStatsContainer}>
					<StatsCard
						linkCard
						bgColor={{
							backgroundColor: blue[500],
						}}
						textColor={{ color: 'white' }}
						subtitle={t('LABEL_TOTAL_IMPRESSIONS')}
						title={`${0}`}
					></StatsCard>
					{side === 'advertiser' && (
						<StatsCard
							linkCard
							bgColor={{
								backgroundColor: red[500],
							}}
							textColor={{ color: 'white' }}
							subtitle={t('LABEL_TOTAL_SPENT')}
							title={`${0} DAI`}
						></StatsCard>
					)}

					{side === 'publisher' && (
						<StatsCard
							linkCard
							bgColor={{
								backgroundColor: green[200],
							}}
							textColor={{ color: 'white' }}
							subtitle={t('LABEL_TOTAL_REVENUE')}
							title={`${0} DAI`}
						></StatsCard>
					)}
					<StatsCard
						linkCard
						bgColor={{
							backgroundColor: blueGrey[500],
						}}
						textColor={{ color: 'white' }}
						subtitle={t('LABEL_AVG_CPM')}
						title={`${0} DAI`}
					></StatsCard>
				</div>
			</Grid>
			<Grid item xs={12} sm={6} md={3}>
				<Dropdown
					fullWidth
					label={t('SELECT_TIMEFRAME')}
					onChange={val => setTimeframe(val)}
					source={timeFrames}
					value={timeframe}
					htmlId='timeframe-select'
				/>
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

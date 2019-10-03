import React, { useState } from 'react'
import { SimpleStatistics } from 'components/dashboard/charts/simplified'
import Dropdown from 'components/common/dropdown'
import Grid from '@material-ui/core/Grid'

const timeFrames = [
	{ label: 'hour', value: 'hour' },
	{ label: 'day', value: 'day' },
	{ label: 'week', value: 'week' },
	// { label: 'month', value: 'month' },
	// { label: 'year', value: 'year' },
]

const metrics = {
	publisher: [
		{ label: 'Revenue', value: 'eventPayouts' },
		{ label: 'Impressions', value: 'eventCounts' },
	],
	advertiser: [
		{ label: 'Spent', value: 'eventPayouts' },
		{ label: 'Impressions', value: 'eventCounts' },
	],
}

const getYlabel = side => {
	switch (side) {
		case 'advertiser':
			return 'IMPRESSION'
		case 'publisher':
			return 'REVENUE'
		default:
			return 'DATA'
	}
}

export function BasicStats({ aggregates, side, t }) {
	const [timeframe, setTimeframe] = useState(timeFrames[0].value)
	const [metric, setMetric] = useState(metrics[side][0].value)
	const data = aggregates[side] || {}

	return (
		<Grid container spacing={2}>
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
			<Grid item xs={12} sm={6} md={3}>
				<Dropdown
					fullWidth
					label={t('SELECT_METRICS')}
					onChange={val => setMetric(val)}
					source={metrics[side]}
					value={metric}
					htmlId='metric-select'
				/>
			</Grid>
			<Grid item xs={12}>
				<SimpleStatistics
					data={(data[timeframe] || {}).aggr}
					metric={(data[timeframe] || {}).metric}
					options={{ title: t(timeframe) }}
					yLabel={getYlabel(side)}
					t={t}
				/>
			</Grid>
		</Grid>
	)
}

import React, { useState } from 'react'
import { SimpleStatistics } from 'components/dashboard/charts/simplified'
import Dropdown from 'components/common/dropdown'
import Grid from '@material-ui/core/Grid'
import { translate } from 'services/translations/translations'

const timeFrames = [
	{ label: translate('LABEL_HOUR'), value: 'hour' },
	{ label: translate('LABEL_DAY'), value: 'day' },
	{ label: translate('LABEL_WEEK'), value: 'week' },
	{ label: translate('LABEL_MONTH'), value: 'month' },
	{ label: translate('LABEL_YEAR'), value: 'year' },
]

const metrics = {
	publisher: [
		{ label: translate('LABEL_REVENUE'), value: 'eventPayouts' },
		{ label: translate('LABEL_IMPRESSIONS'), value: 'eventCounts' },
	],
	advertiser: [
		{ label: translate('LABEL_SPENT'), value: 'eventPayouts' },
		{ label: translate('LABEL_IMPRESSIONS'), value: 'eventCounts' },
	],
}

const getYlabel = metric => {
	switch (metric) {
		case 'eventCounts':
			return 'IMPRESSIONS'
		case 'eventPayouts':
			return 'DAI'
		default:
			return 'DATA'
	}
}

const getData = ({ data, timeframe, metric } = {}) => {
	return data['IMPRESSION'][metric][timeframe] || {}
}

export function BasicStats({ analytics, side, t }) {
	const [timeframe, setTimeframe] = useState(timeFrames[0].value)
	const [metric, setMetric] = useState(metrics[side][0].value)
	const data = analytics[side] || {}

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
					data={getData({ data, metric, timeframe }).aggr}
					metric={metric}
					options={{ title: t(timeframe) }}
					yLabel={getYlabel(metric)}
					eventType={'IMPRESSION'}
					t={t}
				/>
			</Grid>
		</Grid>
	)
}

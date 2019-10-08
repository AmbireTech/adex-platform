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

export function BasicStats({ analytics, side, t }) {
	const [timeframe, setTimeframe] = useState(timeFrames[0].value)
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
			<Grid item xs={12}>
				<SimpleStatistics
					data={data['IMPRESSION']}
					timeframe={timeframe}
					options={{
						title: t(timeFrames.find(a => a.value === timeframe).label),
					}}
					y1Label={metrics[side][0].label}
					y2Label={metrics[side][1].label}
					eventType={'IMPRESSION'}
					t={t}
				/>
			</Grid>
		</Grid>
	)
}

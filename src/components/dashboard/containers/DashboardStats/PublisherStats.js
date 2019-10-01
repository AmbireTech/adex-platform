import React, { useState } from 'react'
import { PublisherSimpleStatistics } from 'components/dashboard/charts/revenue'
import Dropdown from 'components/common/dropdown'

const timeFrames = [
	{ label: 'hour', value: 'hour' },
	{ label: 'day', value: 'day' },
	{ label: 'week', value: 'week' },
	{ label: 'month', value: 'month' },
	{ label: 'year', value: 'year' },
]

export function PublisherStats({ aggregates, t }) {
	const [timeframe, setTimeframe] = useState('hour')
	const aggr = aggregates.publisher || {}

	return (
		<div>
			<div>
				<Dropdown
					label={t('SELECT_TIMEFRAME')}
					onChange={val => setTimeframe(val)}
					source={timeFrames}
					value={timeframe}
					htmlId='page-size-select'
				/>
			</div>
			<PublisherSimpleStatistics
				data={(aggr[timeframe] || {}).aggr}
				options={{ title: t(timeframe) }}
				t={t}
			/>
		</div>
	)
}

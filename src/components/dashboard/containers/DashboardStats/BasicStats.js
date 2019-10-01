import React, { useState } from 'react'
import { SimpleStatistics } from 'components/dashboard/charts/simplified'
import Dropdown from 'components/common/dropdown'

const timeFrames = [
	{ label: 'hour', value: 'hour' },
	{ label: 'day', value: 'day' },
	{ label: 'week', value: 'week' },
	{ label: 'month', value: 'month' },
	{ label: 'year', value: 'year' },
]

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
	const [timeframe, setTimeframe] = useState('hour')
	const data = aggregates[side] || {}

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
			<SimpleStatistics
				data={(data[timeframe] || {}).aggr}
				metric={(data[timeframe] || {}).metric}
				options={{ title: t(timeframe) }}
				yLabel={getYlabel(side)}
				t={t}
			/>
		</div>
	)
}

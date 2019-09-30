import React from 'react'
import { PublisherSimpleStatistics } from 'components/dashboard/charts/revenue'

export const PublisherStats = ({ aggregates, t }) => {
	// console.log('data', data)
	return (
		<div>
			<PublisherSimpleStatistics
				data={aggregates[0].aggr}
				options={{ title: t(aggregates[0].timeframe) }}
				t={t}
			/>
		</div>
	)
}

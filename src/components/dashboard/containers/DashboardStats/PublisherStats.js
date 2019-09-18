import React from 'react'
import { PublisherStatistics } from 'components/dashboard/charts/revenue'
import { BidsTimeStatistics } from 'components/dashboard/charts/slot/bidsStatistics'
const getHourId = _id => {
	return `${_id.year}-${_id.month}-${_id.day}-${_id.hour}`
}

const getDayId = _id => {
	return `${_id.year}-${_id.month}-${_id.day}`
}

const mapAggregates = ({ aggregates = [] }) => {
	return aggregates.reduce(
		({ hourly, daily, channels }, a) => {
			const { aggr = [], channel = {} } = a

			const channelData = aggr.reduce(
				({ channelHourly, channelDaily }, e) => {
					const { _id, value } = e

					const hourId = getHourId(_id)
					channelHourly[hourId] = value

					const dayId = getDayId(_id)

					channelDaily[dayId] = channelDaily[dayId] || 0
					channelDaily[dayId] += value

					return {
						channelHourly,
						channelDaily,
					}
				},
				{ channelHourly: {}, channelDaily: {} }
			)

			hourly[channel.id] = channelData.channelHourly
			daily[channel.id] = channelData.channelDaily
			channels[channel.id] = channel

			return {
				hourly,
				daily,
				channels,
			}
		},
		{ hourly: {}, daily: {}, channels: {} }
	)
}

export const PublisherStats = ({ aggregates, t }) => {
	const data = mapAggregates({ aggregates })

	// console.log('data', data)
	return (
		<div>
			<PublisherStatistics
				data={data.daily}
				channels={data.channels}
				options={{ title: t('DAILY') }}
				t={t}
			/>
			<PublisherStatistics
				data={data.hourly}
				channels={data.channels}
				options={{ title: t('HOURLY') }}
				t={t}
			/>
		</div>
	)
}

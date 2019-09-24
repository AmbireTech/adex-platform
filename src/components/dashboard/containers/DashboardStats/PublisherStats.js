import React from 'react'
import { PublisherStatistics } from 'components/dashboard/charts/revenue'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'

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
	const [values, setValues] = React.useState({
		period: 'hourly',
	})
	const handleChange = event => {
		setValues(oldValues => ({
			...oldValues,
			[event.target.name]: event.target.value,
		}))
	}
	const data = mapAggregates({ aggregates })
	return (
		<div>
			<form autoComplete='off'>
				<FormControl>
					<InputLabel htmlFor='age-simple'>Age</InputLabel>
					<Select
						value={values.period}
						onChange={handleChange}
						inputProps={{
							name: 'period',
						}}
					>
						<MenuItem value={'hourly'}>Hourly</MenuItem>
						<MenuItem value={'daily'}>Daily</MenuItem>
					</Select>
				</FormControl>
			</form>
			<PublisherStatistics
				data={data[values.period]}
				channels={data.channels}
				options={{ title: t(values.period) }}
				t={t}
			/>
		</div>
	)
}

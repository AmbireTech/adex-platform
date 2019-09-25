import React, { useState } from 'react'
import { PublisherStatistics } from 'components/dashboard/charts/revenue'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { Box } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns'
import { getValidatorStats } from 'services/smart-contracts/actions/stats'
import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker,
} from '@material-ui/pickers'

const getHourId = _id => {
	return `${_id.year}-${_id.month}-${_id.day}-${_id.hour}`
}

const getDayId = _id => {
	return `${_id.year}-${_id.month}-${_id.day}`
}

const mapAggregates = ({ aggregates = [] }) => {
	return aggregates.reduce(
		({ hour, day, channels }, a) => {
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

			hour[channel.id] = channelData.channelHourly
			day[channel.id] = channelData.channelDaily
			channels[channel.id] = channel

			return {
				hour,
				day,
				channels,
			}
		},
		{ hour: {}, day: {}, channels: {} }
	)
}

export const PublisherStats = async ({ account, aggregates, t }) => {
	const [values, setValues] = useState({
		timeframe: 'hour',
		period: 'today',
	})
	const [selectedFromDate, setSelectedFromDate] = useState(Date.now())
	const [selectedToDate, setSelectedToDate] = useState(Date.now())
	const validatorData = await getValidatorStats({
		account,
		timeframe: values.timeframe,
		period: { from: selectedFromDate, to: selectedToDate },
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
				<Box display='flex' flexWrap='wrap'>
					<Box m={2}>
						<FormControl>
							<InputLabel htmlFor='timeframe'>Timeframe</InputLabel>
							<Select
								value={values.timeframe}
								onChange={handleChange}
								inputProps={{
									name: 'timeframe',
								}}
							>
								<MenuItem value={'minute'}>Live</MenuItem>
								<MenuItem value={'hour'}>Hourly</MenuItem>
								<MenuItem value={'day'}>Daily</MenuItem>
								<MenuItem value={'week'}>Weekly</MenuItem>
								<MenuItem value={'month'}>Monthly</MenuItem>
								<MenuItem value={'year'}>Yearly</MenuItem>
							</Select>
						</FormControl>
					</Box>
					<Box m={2}>
						<FormControl>
							<MuiPickersUtilsProvider utils={DateFnsUtils}>
								<KeyboardDatePicker
									disableToolbar
									variant='inline'
									format='MM/dd/yyyy'
									id='date-picker-inline'
									label='From'
									value={selectedFromDate}
									onChange={setSelectedFromDate}
									KeyboardButtonProps={{
										'aria-label': 'change date',
									}}
								/>
							</MuiPickersUtilsProvider>
						</FormControl>
					</Box>
					<Box m={2}>
						<FormControl>
							<MuiPickersUtilsProvider utils={DateFnsUtils}>
								<KeyboardDatePicker
									disableToolbar
									variant='inline'
									format='MM/dd/yyyy'
									id='date-picker-inline'
									label='To'
									value={selectedToDate}
									onChange={setSelectedToDate}
									KeyboardButtonProps={{
										'aria-label': 'change date',
									}}
								/>
							</MuiPickersUtilsProvider>
						</FormControl>
					</Box>
					<Box m={2}>
						<FormControl>
							<InputLabel htmlFor='period'>Period</InputLabel>
							<Select
								value={values.period}
								onChange={handleChange}
								inputProps={{
									name: 'period',
								}}
							>
								<MenuItem value={'today'}>Today</MenuItem>
								<MenuItem value={'yesterday'}>Yesterday</MenuItem>
								<MenuItem value={'7Days'}>Last 7 Days</MenuItem>
								<MenuItem value={'30Days'}>Last 30 Days</MenuItem>
								<MenuItem value={'thisMonth'}>This Month</MenuItem>
								<MenuItem value={'lastMonth'}>Last Month</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</Box>
			</form>
			<PublisherStatistics
				data={data[values.timeframe] || []}
				channels={data.channels}
				options={{ title: t(values.timeframe.toUpperCase()) }}
				t={t}
			/>
		</div>
	)
}

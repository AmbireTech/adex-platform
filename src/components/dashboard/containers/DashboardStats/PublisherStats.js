import React from 'react'
import { PublisherStatistics } from 'components/dashboard/charts/revenue'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { Box } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns'
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
		timeframe: 'hourly',
		period: 'today',
	})
	const [selectedFromDate, setSelectedFromDate] = React.useState(Date.now())
	const [selectedToDate, setSelectedToDate] = React.useState(Date.now())
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
							<InputLabel htmlFor='age-simple'>Age</InputLabel>
							<Select
								value={values.timeframe}
								onChange={handleChange}
								inputProps={{
									name: 'period',
								}}
							>
								<MenuItem value={'hourly'}>Hourly</MenuItem>
								<MenuItem value={'daily'}>Daily</MenuItem>
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
									label='Date picker inline'
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
									label='Date picker inline'
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
							<InputLabel htmlFor='age-simple'>Age</InputLabel>
							<Select
								value={values.period}
								onChange={handleChange}
								inputProps={{
									name: 'period',
								}}
							>
								<MenuItem value={'today'}>Today</MenuItem>
								<MenuItem value={'daily'}>Daily</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</Box>
			</form>
			<PublisherStatistics
				data={data[values.timeframe]}
				channels={data.channels}
				options={{ title: t(values.timeframe.toUpperCase()) }}
				t={t}
			/>
		</div>
	)
}

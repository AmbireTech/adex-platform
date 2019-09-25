import React, { useState, useEffect } from 'react'
import { format, eachDayOfInterval, subDays } from 'date-fns'
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
import { type } from 'os'

const getMinuteId = ({ year, month, day, hour }) => {
	return format(new Date(year, month, day, hour), 'MM-dd-yyyy HH:MM')
}

const getHourId = ({ year, month, day, hour }) => {
	return format(new Date(year, month, day, hour), 'MM-dd-yyyy HH')
}

const getDayId = ({ year, month, day, hour }) => {
	return format(new Date(year, month, day, hour), 'MM-dd-yyyy')
}

const mapAggregates = ({
	aggregates = [],
	selectedFromDate,
	selectedToDate,
	timeframe,
}) => {
	let daysPeriod = {}
	let period = eachDayOfInterval({
		start: selectedFromDate,
		end: selectedToDate,
	})

	return aggregates.reduce(
		({ result, channels }, a) => {
			const { aggr = [], channel = {} } = a
			const channelData = aggr.reduce(
				({ result }, e) => {
					const { _id, value } = e
					let id = getHourId(_id)
					switch (timeframe) {
						case 'minute':
							id = getMinuteId(_id)
							break
						case 'hour':
							id = getHourId(_id)
							break
						case 'day':
							id = getDayId(_id)
							break
						default:
							id = getHourId(_id)
							break
					}
					result[id] = result[id] || 0
					result[id] += value
					return { result }
				},
				{ result: {} }
			)
			result[channel.id] = channelData.result
			channels[channel.id] = channel
			return { result, channels }
		},
		{ result: {}, channels: {} }
	)
}

export const PublisherStats = ({ aggregates, t }) => {
	const [timeframe, setTimeframe] = useState('hour')
	const [period, setPeriod] = useState('today')
	const [selectedFromDate, setSelectedFromDate] = useState(
		subDays(Date.now(), 1)
	)
	// Gets initial state form the store aggregates that are passed
	const [stats, setStats] = useState(aggregates)
	const [selectedToDate, setSelectedToDate] = useState(Date.now())
	const data = mapAggregates({
		aggregates: stats,
		selectedFromDate,
		selectedToDate,
		timeframe,
	})
	return (
		<div>
			<form autoComplete='off'>
				<Box display='flex' flexWrap='wrap'>
					<Box m={2}>
						<FormControl>
							<InputLabel htmlFor='timeframe'>Timeframe</InputLabel>
							<Select
								value={timeframe}
								onChange={e => setTimeframe(e.target.value)}
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
								value={period}
								onChange={e => setPeriod(e.target.value)}
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
				data={data.result || []}
				channels={data.channels}
				options={{ title: t(timeframe.toUpperCase()) }}
				t={t}
			/>
		</div>
	)
}

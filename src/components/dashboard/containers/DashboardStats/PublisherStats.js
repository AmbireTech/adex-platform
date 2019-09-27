import React, { useState, useEffect } from 'react'
import {
	format,
	subDays,
	isWithinInterval,
	addMinutes,
	addHours,
} from 'date-fns'
import { PublisherStatistics } from 'components/dashboard/charts/revenue'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import DateRangeIcon from '@material-ui/icons/DateRange'
import { Box } from '@material-ui/core'
import DateFnsUtils from '@date-io/date-fns'
import { getValidatorStats } from 'services/smart-contracts/actions/stats'
import {
	DateRangePicker,
	DateRange,
} from '@matharumanpreet00/react-daterange-picker'
import { Popover, Chip } from '@material-ui/core'
import { addDays } from 'date-fns/esm'

const FORMAT_MINUTE = 'MM-dd-yyyy HH:MM'
const FORMAT_HOUR = 'MM-dd-yyyy HH'
const FORMAT_DAY = 'MM-dd-yyyy'

const getFormatedDate = ({ year, month, day, hour, minute }, formatString) => {
	return format(new Date(year, month, day, hour, minute), formatString)
}
const mapByTimeframe = timeframe => {
	switch (timeframe) {
		case 'minute':
			return { formatString: FORMAT_MINUTE, addFunction: addMinutes }
		case 'hour':
			return { formatString: FORMAT_HOUR, addFunction: addHours }
		case 'day':
			return { formatString: FORMAT_DAY, addFunction: addDays }
		default:
			return { formatString: FORMAT_HOUR, addFunction: addHours }
	}
}

const getRangeTime = ({ start, end }, addFunction, formatString) => {
	let time = {}
	for (let p = start; p <= end; p = addFunction(p, 1)) {
		time[format(p, formatString)] = 0
	}
	return time
}

const mapAggregates = ({ aggregates = [], dateRange, timeframe }) => {
	const interval = {
		start: dateRange.startDate,
		end: dateRange.endDate,
	}
	const { formatString, addFunction } = mapByTimeframe(timeframe)
	const rangeTime = getRangeTime(interval, addFunction, formatString)
	console.log('RANGETIME:', rangeTime)

	return aggregates.reduce(
		({ result, channels }, a) => {
			const { aggr = [], channel = {} } = a

			const channelData = aggr.reduce(
				({ result }, e) => {
					const { _id, value } = e
					const { year, month, day } = _id
					const itemDate = new Date(year, month, day)
					if (isWithinInterval(itemDate, interval)) {
						const id = getFormatedDate(_id, formatString)
						result[id] = result[id] || 0
						result[id] += value
					}
					return { result }
				},
				{ result: {} }
			)
			// TODO: add missing dates / time to result[channel.id]
			result[channel.id] = channelData.result
			channels[channel.id] = channel
			return { result, channels }
		},
		{ result: {}, channels: {} }
	)
}

export const PublisherStats = ({ aggregates, t }) => {
	const [timeframe, setTimeframe] = useState('hour')
	const [anchorEl, setAnchorEl] = React.useState(null)
	const handleClick = event => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}
	const open = Boolean(anchorEl)
	const id = open ? 'simple-popover' : undefined

	const [dateRange, setDateRange] = useState({
		startDate: subDays(new Date(), 7),
		endDate: new Date(),
	})
	// Gets initial state form the store aggregates that are passed
	const [stats, setStats] = useState(aggregates)
	const data = mapAggregates({
		aggregates: stats,
		dateRange,
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
					<Box m={2} display='flex' alignItems='flex-end'>
						<Chip
							label={
								dateRange.startDate && dateRange.endDate
									? `${format(dateRange.startDate, 'MM/dd/yyyy')} - ${format(
											dateRange.endDate,
											'MM/dd/yyyy'
									  )}`
									: 'Choose Date Range'
							}
							onClick={handleClick}
							icon={<DateRangeIcon />}
						/>
						<Popover
							id={id}
							open={open}
							anchorEl={anchorEl}
							onClose={handleClose}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
						>
							<DateRangePicker
								initialDateRange={dateRange}
								maxDate={Date.now()}
								open={open}
								onChange={range => setDateRange(range)}
							/>
						</Popover>
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

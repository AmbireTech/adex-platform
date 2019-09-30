import React, { useState, useEffect } from 'react'
import {
	format,
	subDays,
	isWithinInterval,
	addMinutes,
	addHours,
	addYears,
} from 'date-fns'
import { PublisherStatistics } from 'components/dashboard/charts/revenue'
import Divider from '@material-ui/core/Divider'
import FilterListIcon from '@material-ui/icons/FilterList'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import DateRangeIcon from '@material-ui/icons/DateRange'
import { Box } from '@material-ui/core'
import { DateRangePicker } from '@matharumanpreet00/react-daterange-picker'
import { Popover, Chip } from '@material-ui/core'
import { addDays, addMonths } from 'date-fns/esm'

const FORMAT_MINUTE = 'MM/dd/yyyy HH:mm'
const FORMAT_HOUR = 'MM/dd/yyyy HH'
const FORMAT_DAY = 'MM/dd/yyyy'
const FORMAT_MONTH = 'MM/yyyy'
const FORMAT_YEAR = 'MM/yyyy'

const getFormatedDate = (
	{ year, month, day = 1, hour = 0, minutes = 0 },
	formatString
) => {
	return format(new Date(year, month, day, hour, minutes), formatString)
}

const mapByTimeframe = timeframe => {
	switch (timeframe) {
		case 'minute':
			return { formatString: FORMAT_MINUTE, addFunction: addMinutes }
		case 'hour':
			return { formatString: FORMAT_HOUR, addFunction: addHours }
		case 'day':
			return { formatString: FORMAT_DAY, addFunction: addDays }
		case 'month':
			return { formatString: FORMAT_MONTH, addFunction: addMonths }
		case 'year':
			return { formatString: FORMAT_YEAR, addFunction: addYears }
		default:
			return { formatString: FORMAT_HOUR, addFunction: addHours }
	}
}

const getRangeTime = ({ start, end }, addFunction, formatString) => {
	let time = {}
	for (let p = start; p <= end; p = addFunction(p, 1)) {
		time[format(p, formatString)] = null
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

	return aggregates.reduce(
		({ result, channels }, a) => {
			const { aggr = [], channel = {} } = a

			const channelData = aggr.reduce(
				({ result = [] }, e) => {
					const { _id, value } = e
					const { year, month, day = 1, hour = 0, minute = 0 } = _id
					const itemDate = new Date(year, month, day)
					if (isWithinInterval(itemDate, interval)) {
						const id = getFormatedDate(_id, formatString)
						result[id] = result[id] || 0
						result[id] += value
					}
					return { result }
				},
				{ result: [] }
			)
			result[channel.id] = { ...rangeTime, ...channelData.result }
			channels[channel.id] = channel
			return { result, channels }
		},
		{ result: {}, channels: {} }
	)
}

export const PublisherStats = ({ aggregates, t }) => {
	const [timeframe, setTimeframe] = useState('hour')
	const [minDate, setMinDate] = useState()
	const [campaigns, setCampaigns] = useState([])
	const [anchorEl, setAnchorEl] = React.useState(null)
	const handleClick = event => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	//TODO: check how to open two separate
	const open = Boolean(anchorEl)
	const id = open ? 'simple-popover' : undefined

	const [dateRange, setDateRange] = useState({
		startDate: subDays(new Date(), 7),
		endDate: new Date(),
	})
	// Gets initial state form the store aggregates that are passed
	const [stats, setStats] = useState(aggregates[timeframe])
	useEffect(() => {
		setStats(aggregates[timeframe])
	}, [aggregates, timeframe])

	useEffect(() => {
		switch (timeframe) {
			case 'minute':
				setMinDate(subDays(Date.now(), 1))
				break
			case 'hour':
				setMinDate(subDays(Date.now(), 7))
				break
			case 'day':
				setMinDate(subDays(Date.now(), 90))
				break
			case 'week':
				setMinDate(subDays(Date.now(), 356))
				break
			default:
				break
		}
	})

	const data = mapAggregates({
		aggregates: stats,
		dateRange,
		timeframe,
	})

	return (
		<div>
			<form autoComplete='off'>
				<Box mb={3} display='flex' flexWrap='wrap'>
					<Box m={1}>
						<Chip
							label={
								campaigns.length > 0
									? `${campaigns[0]}${
											campaigns.length > 1
												? `, and ${campaigns.length - 1} more`
												: ''
									  }`
									: 'All Campaigns'
							}
							onClick={handleClick}
							icon={<FilterListIcon />}
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
							Filter Campaigns
						</Popover>
					</Box>
					<Box m={1}>
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
								minDate={minDate}
								maxDate={Date.now()}
								open={open}
								onChange={range => setDateRange(range)}
							/>
						</Popover>
					</Box>
					<Box m={1}>
						<Chip
							color='primary'
							label={'LAST 24 HOURS'}
							onClick={() => console.log('24')}
						/>
					</Box>
					<Box m={1}>
						<Chip color='primary' label={'THIS WEEK'} />
					</Box>
					<Box m={1}>
						<Chip color='primary' label={'THIS MONTH'} />
					</Box>
					<Box m={1}>
						<Chip color='primary' label={'LAST MONTH'} />
					</Box>
				</Box>
				<Divider light />
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
				</Box>
			</form>
			<PublisherStatistics
				timeframe={timeframe}
				data={data.result || []}
				channels={data.channels}
				options={{ title: t(timeframe.toUpperCase()) }}
				t={t}
			/>
		</div>
	)
}

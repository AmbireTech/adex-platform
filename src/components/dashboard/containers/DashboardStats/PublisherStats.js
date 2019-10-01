import React, { useState, useEffect } from 'react'
import {
	format,
	subDays,
	subHours,
	subWeeks,
	subMonths,
	startOfWeek,
	endOfWeek,
	endOfMonth,
	startOfMonth,
	isWithinInterval,
	addMinutes,
	addHours,
	addYears,
} from 'date-fns'
import { PublisherStatistics } from 'components/dashboard/charts/revenue'
import TransferList from 'components/common/transferList/TransferList'
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

const shorten = address => {
	const beginning = address.substring(0, 6)
	const ending = address.substring(address.length - 4)
	return beginning.concat('...', ending)
}

const getFormatedDate = (
	{ year, month, day = 1, hour = 0, minute = 0 },
	formatString
) => {
	return format(new Date(year, month, day, hour, minute), formatString)
}

const timeframeMap = {
	minute: { formatString: FORMAT_MINUTE, addFunction: addMinutes },
	hour: { formatString: FORMAT_HOUR, addFunction: addHours },
	day: { formatString: FORMAT_DAY, addFunction: addDays },
	month: { formatString: FORMAT_MONTH, addFunction: addMonths },
	year: { formatString: FORMAT_YEAR, addFunction: addYears },
}

const getRangeTime = ({ start, end }, addFunction, formatString) => {
	console.time('time')
	let time = {}
	for (let p = start; p <= end; p = addFunction(p, 1)) {
		time[format(p, formatString)] = null
	}
	console.timeEnd('time')
	return time
}

const mapAggregates = ({ aggregates = [], dateRange, timeframe }) => {
	const interval = {
		start: dateRange.startDate,
		end: dateRange.endDate,
	}
	const { formatString, addFunction } = timeframeMap[timeframe]
	const rangeTime = getRangeTime(interval, addFunction, formatString)
	console.time('aggrInside')
	const resultData = aggregates.reduce(
		({ result, channels }, a) => {
			const { aggr = [], channel = {} } = a
			const channelData = aggr.reduce(
				({ result = [] }, e) => {
					const { _id, value } = e
					const { year, month, day = 1 } = _id
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
			// This puts the missing time / date to the chart
			result[channel.id] = { ...rangeTime, ...channelData.result }
			channels[channel.id] = channel
			return { result, channels }
		},
		{ result: {}, channels: {} }
	)
	console.timeEnd('aggrInside')
	return resultData
}

export const PublisherStats = ({ aggregates, t }) => {
	const [timeframe, setTimeframe] = useState('hour')
	const [stats, setStats] = useState(aggregates[timeframe])
	const [minDate, setMinDate] = useState()
	const [campaigns, setCampaigns] = useState([])
	const [left, setLeft] = useState(
		aggregates.hour.reduce((array, curr) => {
			const id = curr.channel.id
			array.push({ id, text: shorten(id) })
			return array
		}, [])
	)
	const [right, setRight] = useState([])
	const [anchorCampaignFilter, setAnchorCampaignFilter] = useState(null)
	const [anchorDatePicker, setAnchorDatePicker] = useState(null)
	const [data, setData] = useState([])
	const [dateRange, setDateRange] = useState({
		startDate: subDays(new Date(), 7),
		endDate: new Date(),
	})
	const minTime = {
		minute: subHours(Date.now(), 24),
		hour: subMonths(Date.now(), 1),
		day: subMonths(Date.now(), 12),
		week: subMonths(Date.now(), 24),
	}

	useEffect(() => {
		if (right.length > 0) {
			const test = Object.keys(aggregates).map(item => {
				const values = aggregates[item].filter(function(e) {
					return (
						this.map(j => {
							return j.id
						}).indexOf(e.channel.id) >= 0
					)
				}, right)
				return { [item]: values }
			})
		}
	}, [right])

	useEffect(() => {
		setData(
			mapAggregates({
				aggregates: stats,
				dateRange,
				timeframe,
			})
		)
	}, [dateRange])

	useEffect(() => {
		setMinDate(minTime[timeframe])
		if (minTime[timeframe] > dateRange.startDate) {
			setDateRange(prevValue => ({
				...prevValue,
				startDate: minTime[timeframe],
			}))
		}
		setStats(aggregates[timeframe])
	}, [timeframe])

	// Gets initial state form the store aggregates that are passed
	useEffect(() => {}, [dateRange, timeframe])

	const handleClick = (setter, event) => {
		setter(event.currentTarget)
	}

	const handleClose = setter => {
		setter(null)
	}
	// This is used for the quick swithc chips on top of the chart
	const handleQuickSwitchPeriodChange = period => {
		switch (period) {
			case '24-hours':
				setDateRange({
					startDate: subHours(Date.now(), 24),
					endDate: Date.now(),
				})
				setTimeframe('hour')
				break
			case 'this-week':
				setDateRange({
					startDate: startOfWeek(Date.now()),
					endDate: Date.now(),
				})
				setTimeframe('hour')
				break
			case 'last-week':
				setDateRange({
					startDate: startOfWeek(subWeeks(Date.now(), 1)),
					endDate: endOfWeek(subWeeks(Date.now(), 1)),
				})
				setTimeframe('hour')
				break
			case 'this-month':
				setDateRange({
					startDate: startOfMonth(Date.now()),
					endDate: Date.now(),
				})
				setTimeframe('day')
				break
			case 'last-month':
				setDateRange({
					startDate: startOfMonth(subMonths(Date.now(), 1)),
					endDate: endOfMonth(subMonths(Date.now(), 1)),
				})
				setTimeframe('day')
				break
			default:
				break
		}
	}

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
							onClick={e => handleClick(setAnchorCampaignFilter, e)}
							icon={<FilterListIcon />}
						/>
						<Popover
							id={'campaign-filter'}
							open={Boolean(anchorCampaignFilter)}
							anchorEl={anchorCampaignFilter}
							onClose={e => handleClose(setAnchorCampaignFilter, e)}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'left',
							}}
							transformOrigin={{
								vertical: 'top',
								horizontal: 'left',
							}}
						>
							<TransferList
								unfilteredState={[left, setLeft]}
								filteredState={[right, setRight]}
							/>
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
							onClick={e => handleClick(setAnchorDatePicker, e)}
							icon={<DateRangeIcon />}
						/>
						<Popover
							id={'daterange-picker'}
							open={Boolean(anchorDatePicker)}
							anchorEl={anchorDatePicker}
							onClose={e => handleClose(setAnchorDatePicker, e)}
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
								definedRanges={[]}
								minDate={minDate}
								maxDate={Date.now()}
								open={Boolean(setAnchorDatePicker)}
								onChange={range => setDateRange(range)}
							/>
						</Popover>
					</Box>
					<Box m={1}>
						<Chip
							color='primary'
							label={'LAST 24 HOURS'}
							onClick={() => handleQuickSwitchPeriodChange('24-hours')}
						/>
					</Box>
					<Box m={1}>
						<Chip
							color='primary'
							label={'THIS WEEK'}
							onClick={() => handleQuickSwitchPeriodChange('this-week')}
						/>
					</Box>
					<Box m={1}>
						<Chip
							color='primary'
							label={'LAST WEEK'}
							onClick={() => handleQuickSwitchPeriodChange('last-week')}
						/>
					</Box>
					<Box m={1}>
						<Chip
							color='primary'
							label={'THIS MONTH'}
							onClick={() => handleQuickSwitchPeriodChange('this-month')}
						/>
					</Box>
					<Box m={1}>
						<Chip
							color='primary'
							label={'LAST MONTH'}
							onClick={() => handleQuickSwitchPeriodChange('last-month')}
						/>
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

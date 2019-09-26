import React, { useState, useEffect } from 'react'
import { format, eachDayOfInterval, subDays, isWithinInterval } from 'date-fns'
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

const getMinuteId = ({ year, month, day, hour }) => {
	return format(new Date(year, month, day, hour), 'MM-dd-yyyy HH:MM')
}

const getHourId = ({ year, month, day, hour }) => {
	return format(new Date(year, month, day, hour), 'MM-dd-yyyy HH')
}

const getDayId = ({ year, month, day, hour }) => {
	return format(new Date(year, month, day, hour), 'MM-dd-yyyy')
}

const mapAggregates = ({ aggregates = [], dateRange, timeframe }) => {
	const interval = {
		start: dateRange.startDate,
		end: dateRange.endDate,
	}
	let period = eachDayOfInterval(interval)

	return aggregates.reduce(
		({ result, channels }, a) => {
			const { aggr = [], channel = {} } = a
			const channelData = aggr.reduce(
				({ result }, e) => {
					const { _id, value } = e
					// TODO: filter if not in range
					const { year, month, day } = _id
					const itemDate = new Date(year, month, day)
					if (isWithinInterval(itemDate, interval)) {
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

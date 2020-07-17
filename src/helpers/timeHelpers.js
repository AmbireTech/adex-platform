import dateUtils from 'helpers/dateUtils'
import { t } from 'selectors'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

export const fillEmptyTime = (
	prevAggr,
	timeframe,
	defaultValue = 0,
	fillAfterLast = 0,
	period
) => {
	const now = Date.now()
	const time = {
		interval: period,
		step: { ammount: 1, unit: 'minute' },
	}
	switch (timeframe) {
		case 'hour':
			time.step = { ammount: 1, unit: 'minute' }
			break
		case 'day':
			time.step = { ammount: 1, unit: 'hour' }
			break
		case 'week':
			time.step = { ammount: 6, unit: 'hour' }
			break
		case 'month':
			time.step = { ammount: 1, unit: 'day' }
			break
		default:
			return prevAggr
	}
	const newAggr = []

	for (
		var m = dateUtils.date(time.interval.start);
		dateUtils.getDiff(m, time.interval.end) <= 0;
		dateUtils.add(m, time.step.ammount, time.step.unit)
	) {
		newAggr.push({ value: defaultValue, time: dateUtils.getUnix(m) * 1000 })
	}

	const prevAggrInInterval = prevAggr
		.filter(a => {
			const m = dateUtils.date(a.time)
			return (
				dateUtils.getDiff(m, time.interval.start) >= 0 &&
				dateUtils.getDiff(m, time.interval.end) <= 0
			)
		})
		.sort((a, b) => b.time - a.time)

	const lastWithValueTime = (prevAggrInInterval[0] || {}).time || now

	const data = [...prevAggrInInterval, ...newAggr].reduce((data, a) => {
		const newData = { ...data }
		const isNullValue = a.value === null || data[a.time] === null
		const value =
			a.time <= lastWithValueTime
				? isNullValue
					? null
					: data[a.time] || a.value || defaultValue
				: fillAfterLast

		newData[a.time] = a.time <= now ? value : null

		return newData
	}, {})

	const result = Object.entries(data)
		.map(([key, value]) => ({
			value,
			time: +key,
		}))
		.sort((a, b) => a.time - b.time)

	return result
}

export const DATETIME_EXPORT_FORMAT = 'YYYY-MM-DD HH:mm:ss'

export const getTimePeriods = ({ timeframe, start }) => {
	let end = null
	const startCopy = start
	switch (timeframe) {
		case 'hour':
			start = +dateUtils.date(startCopy).startOf('minute')
			end = +dateUtils.addHours(dateUtils.date(startCopy), 1).startOf('minute')
			break
		case 'day':
			start = +dateUtils.date(startCopy).startOf('hour')
			end = +dateUtils.addDays(dateUtils.date(startCopy), 1).startOf('hour')
			break
		case 'week':
			start = +dateUtils.date(startCopy).startOf('hour')
			end = +dateUtils.addDays(dateUtils.date(startCopy), 7).startOf('hour')
			break
		case 'month':
			start = +dateUtils.date(startCopy).startOf('day')
			end = +dateUtils.addMonths(dateUtils.date(startCopy), 1).startOf('day')
			break
		default:
			break
	}

	start = +start

	return { start, end }
}

export const getBorderPeriodStart = ({ timeframe, start, next = false }) => {
	const startCopy = start
	const direction = next ? 1 : -1

	switch (timeframe) {
		case 'hour':
			start = +dateUtils.addHours(dateUtils.date(start), direction)
			break
		case 'day':
			start = +dateUtils.addDays(dateUtils.date(start), direction)
			break
		case 'week':
			start = +dateUtils.addWeeks(dateUtils.date(start), direction)
			break
		case 'month':
			start = +dateUtils.addMonths(dateUtils.date(start), direction)
			break
		default:
			start = +dateUtils.addDays(dateUtils.date(start), direction)
			break
	}
	if (dateUtils.isAfter(dateUtils.date(start), dateUtils.date())) {
		start = startCopy
	}

	return start
}

const TIME_INTERVALS = [
	{ label: 'YEAR', ms: YEAR },
	{ label: 'MONTH', ms: MONTH },
	{ label: 'WEEK', ms: WEEK },
	{ label: 'DAY', ms: DAY },
	{ label: 'HOUR', ms: HOUR },
	{ label: 'MINUTE', ms: MINUTE },
	{ label: 'SECOND', ms: SECOND },
]

export const timeAgo = (time, since = Date.now()) => {
	const ms = Math.floor(since - time)
	const interval = TIME_INTERVALS.find(i => i.ms < ms)
	if (!interval) {
		return t('JUST_NOW')
	}

	const intervalTimes = Math.floor(ms / interval.ms)
	return t('TIME_AGO', {
		args: [intervalTimes, interval.label + (intervalTimes > 1 ? 'S' : '')],
	})
}

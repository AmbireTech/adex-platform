import dateUtils from 'helpers/dateUtils'
import { t } from 'selectors'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const YEAR = 365 * DAY
const MONTH = Math.floor(YEAR / 12)

export const DEFAULT_WEEK_HOURS_SPAN = 3

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
		step: { period: 1, span: 'minute' },
	}
	switch (timeframe) {
		case 'hour':
			time.step = {
				unit: 'minute',
				amount: 1,
			}
			break
		case 'day':
			time.step = { unit: 'hour', amount: 1 }
			break
		case 'week':
			time.step = { unit: 'hour', amount: DEFAULT_WEEK_HOURS_SPAN }
			break
		case 'month':
			time.step = { unit: 'day', amount: 1 }
			break
		case 'year':
			time.step = { unit: 'month', amount: 1 }
			break
		default:
			return prevAggr
	}
	const newAggr = []

	let initialTime = +dateUtils.date(time.interval.start)
	let endTime = Math.min(time.interval.end, +dateUtils.date())
	for (
		let m = +dateUtils.date(initialTime);
		m <= endTime;
		m = +dateUtils.add(dateUtils.date(m), time.step.amount, time.step.unit)
	) {
		newAggr.push({ value: defaultValue, time: m })
	}
	const prevAggrInInterval = prevAggr
		.filter(a => {
			const m = a.time
			return m - initialTime >= 0 && m - endTime <= 0
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
	let callEnd = null
	const startCopy = dateUtils.date(start)

	switch (timeframe) {
		case 'hour':
			start = dateUtils.startOfMinute(startCopy)
			end = dateUtils.addMinutes(start, 59)
			callEnd = dateUtils.addMinutes(end, 1)
			break
		case 'day':
			start = dateUtils.startOfHour(startCopy)
			end = dateUtils.addHours(start, 23)
			callEnd = dateUtils.addHours(end, 1)
			break
		case 'week':
			start = dateUtils.getHourSpanStart(startCopy, DEFAULT_WEEK_HOURS_SPAN)
			end = dateUtils.addDays(start, 6)
			callEnd = dateUtils.addHours(end, 6)
			break
		case 'month':
			start = dateUtils.startOfDay(startCopy)
			end = dateUtils.addDays(dateUtils.addMonths(start, 1), -1)
			callEnd = dateUtils.addDays(end, 1)
			break
		case 'year':
			start = dateUtils.date(startCopy).startOf('month')
			end = dateUtils.addMonths(start, 11)
			callEnd = dateUtils.addMonths(end, 1)
			break
		default:
			break
	}

	start = +start
	end = Math.min(+end, +dateUtils.date())
	callEnd = +callEnd

	return { start, end, callEnd }
}

export const getBorderPeriodStart = ({
	timeframe,
	start,
	next = false,
	startIsLive = false,
	minDate,
	maxDate,
}) => {
	const startCopy = dateUtils.date(start)
	const direction = next ? 1 : -1
	let borderStart
	let limitedStart = startCopy

	if (
		next &&
		maxDate &&
		dateUtils.isAfter(startCopy, dateUtils.date(maxDate))
	) {
		limitedStart = dateUtils.date(maxDate)
	}

	if (
		!next &&
		minDate &&
		dateUtils.isBefore(startCopy, dateUtils.date(minDate))
	) {
		limitedStart = dateUtils.date(minDate)
	}

	switch (timeframe) {
		case 'hour':
			borderStart =
				startIsLive && !next
					? dateUtils.startOfHour(limitedStart)
					: dateUtils.addHours(limitedStart, direction)
			break
		case 'day':
			const day =
				startIsLive && !next
					? dateUtils.startOfDay(limitedStart)
					: dateUtils.addDays(limitedStart, direction)
			borderStart = dateUtils.startOfDay(day)
			break
		case 'week':
			const week =
				startIsLive && !next
					? dateUtils.startOfWeek(startCopy)
					: dateUtils.addWeeks(startCopy, direction)
			borderStart = dateUtils.startOfDay(week)
			break
		case 'month':
			const month =
				startIsLive && !next
					? dateUtils.startOfMonth(limitedStart)
					: dateUtils.addMonths(limitedStart, direction)
			borderStart = dateUtils.startOfMonth(month)
			break
		case 'year':
			const year =
				startIsLive && !next
					? dateUtils.startOfYear(limitedStart)
					: dateUtils.addYears(limitedStart, direction)
			borderStart = dateUtils.startOfMonth(year)
			break
		default:
			throw new Error('INVALID_TIMEFRAME')
	}
	if (dateUtils.isAfter(borderStart, dateUtils.date())) {
		borderStart = startCopy
	}

	return +borderStart
}

export const getMinStartDateTimeByTimeframe = ({ timeframe, time }) => {
	const min = dateUtils.date(time)
	switch (timeframe) {
		case 'hour':
			return dateUtils.addMinutes(min, -59)
		case 'day':
			return dateUtils.addHours(min, -23)
		case 'week':
			return dateUtils.addDays(min, -6)
		case 'month':
			return dateUtils.addDays(dateUtils.addMonths(min, -1), 1)
		case 'year':
			return dateUtils.addMonths(min, -11)
		default:
			return min
	}
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

export const DATE_TIME_FORMATS_BY_TIMEFRAME = {
	year: { long: 'YYYY-MM', short: 'YYYY-MM' },
	month: { long: 'YYYY-MM-DD', short: 'YYYY-MM-DD' },
	week: { long: 'YYYY-MM-DD HH:mm', short: 'YYYY-MM-DD HH:mm' },
	day: { long: 'YYYY-MM-DD HH:mm', short: 'YYYY-MM-DD HH:mm' },
	hour: { long: 'YYYY-MM-DD HH:mm', short: 'YYYY-MM-DD HH:mm' },
}

export const getPeriodLabel = ({ timeframe, start, end }) => {
	switch (timeframe) {
		case 'hour':
		case 'day':
		case 'week':
			return `${dateUtils.format(start, 'YYYY/MM/DD HH:mm')} - 
${dateUtils.format(end, 'YYYY/MM/DD HH:mm')}`
		case 'month':
			return `${dateUtils.format(start, 'YYYY/MM/DD')} - 
${dateUtils.format(end, 'YYYY/MM/DD')}`
		case 'year':
			return `${dateUtils.format(start, 'YYYY/MM')} - 
${dateUtils.format(end, 'YYYY/MM')}`
		default:
			throw new Error('INVALID_TIMEFRAME')
	}
}

export const getPeriodDataPointLabel = ({ timeframe, time }) => {
	if (timeframe && time) {
		switch (timeframe) {
			case 'hour':
			case 'day':
				return `${dateUtils.format(time, 'YYYY/MM/DD HH:mm')}`
			case 'week':
				const periodEnd = +dateUtils.addMinutes(
					dateUtils.addHours(dateUtils.date(time), 3),
					-1
				)
				return `${dateUtils.format(time, 'YYYY/MM/DD HH:mm')} - 
${dateUtils.format(periodEnd, 'YYYY/MM/DD HH:mm')}`
			case 'month':
				return `${dateUtils.format(time, 'YYYY/MM/DD')}`
			case 'year':
				return `${dateUtils.format(time, 'YYYY/MM')}`
			default:
				throw new Error('INVALID_TIMEFRAME')
		}
	}
	return ''
}

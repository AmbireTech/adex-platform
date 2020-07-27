import dateUtils from 'helpers/dateUtils'
import { t } from 'selectors'

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const YEAR = 365 * DAY
const MONTH = Math.floor(YEAR / 12)

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
			time.step = { unit: 'hour', amount: 6 }
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
	let endTime = time.interval.end
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
			end = dateUtils.addMinutes(start, 60)
			callEnd = dateUtils.addMinutes(end, 1)
			break
		case 'day':
			start = dateUtils.startOfHour(startCopy)
			end = dateUtils.addHours(start, 24)
			callEnd = dateUtils.addHours(end, 1)
			break
		case 'week':
			start = dateUtils.getHourSpanStart(startCopy, 6)
			end = dateUtils.addDays(start, 7)
			callEnd = dateUtils.addHours(end, 6)
			break
		case 'month':
			start = dateUtils.startOfDay(startCopy)
			end = dateUtils.addMonths(start, 1)
			callEnd = dateUtils.addDays(end, 1)
			break
		case 'year':
			start = dateUtils.date(startCopy).startOf('month')
			end = dateUtils.addMonths(start, 12)
			callEnd = dateUtils.addMonths(end, 1)
			break
		default:
			break
	}

	start = +start
	end = +end
	callEnd = +callEnd

	return { start, end, callEnd }
}

export const getBorderPeriodStart = ({ timeframe, start, next = false }) => {
	const startCopy = dateUtils.date(start)
	const direction = next ? 1 : -1
	let borderStart

	switch (timeframe) {
		case 'hour':
			borderStart = dateUtils.addHours(startCopy, direction)
			break
		case 'day':
			const day = dateUtils.addDays(startCopy, direction)
			borderStart = dateUtils.startOfDay(day)
			break
		case 'week':
			const week = dateUtils.addWeeks(startCopy, direction)
			borderStart = dateUtils.startOfDay(week)
			break
		case 'month':
			const month = dateUtils.addMonths(startCopy, direction)
			borderStart = dateUtils.startOfMonth(month)
			break
		case 'year':
			const year = dateUtils.addYears(startCopy, direction)
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

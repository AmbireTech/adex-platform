import moment from 'moment'

export const intervalsMs = () => {
	const nowUTC = moment.utc()

	// TODO: Make it dynamic
	const lastSixHoursPeriod = Math.floor(
		(nowUTC.clone().valueOf() - nowUTC.clone().startOf('day')) /
			(6 * 60 * 60 * 1000)
	)
	return {
		lastHour: {
			start: moment()
				.startOf('minute')
				.add(1, 'minute')
				.subtract(1, 'hours'),
			end: moment().startOf('minute'),
		},
		last24Hours: {
			start: moment()
				.subtract(1, 'day')
				.startOf('hour')
				.valueOf(),
			end: moment()
				.startOf('hour')
				.valueOf(),
		},
		last7Days: {
			start: nowUTC
				.clone()
				.startOf('day')
				.add(lastSixHoursPeriod * 6, 'hours')
				.subtract(7, 'days')
				.valueOf(),
			end: nowUTC
				.clone()
				.startOf('day')
				.add(lastSixHoursPeriod * 6, 'hours')
				.add(2, 'hours')
				.valueOf(),
		},
		thisWeek: {
			start: moment()
				.utc()
				.startOf('isoWeek')
				.valueOf(),
			end: moment()
				.utc()
				.endOf('isoWeek')
				.valueOf(),
		},
		lastWeek: {
			start: moment()
				.subtract(1, 'week')
				.startOf('isoWeek')
				.valueOf(),
			end: moment()
				.subtract(1, 'week')
				.endOf('isoWeek')
				.valueOf(),
		},
		thisMonth: {
			start: moment()
				.startOf('month')
				.valueOf(),
			end: moment()
				.endOf('month')
				.valueOf(),
		},
		lastMonth: {
			start: moment()
				.subtract(1, 'month')
				.startOf('month')
				.valueOf(),
			end: moment()
				.subtract(1, 'month')
				.endOf('month')
				.valueOf(),
		},
	}
}

export const fillEmptyTime = (
	prevAggr,
	timeframe,
	defaultValue = 0,
	period
) => {
	// const intervals = intervalsMs()
	const time = {
		interval: period,
		step: { ammount: 1, unit: 'minute' },
	}
	switch (timeframe) {
		case 'hour':
			// time.interval = intervals.lastHour
			time.step = { ammount: 1, unit: 'minute' }
			break
		case 'day':
			// time.interval = intervals.last24Hours
			time.step = { ammount: 1, unit: 'hour' }
			break
		case 'week':
			// time.interval = intervals.last7Days
			time.step = { ammount: 6, unit: 'hour' }
			break
		default:
			return prevAggr
	}
	const newAggr = []
	// use DateUtils
	for (
		var m = moment(time.interval.start);
		m.diff(time.interval.end) <= 0;
		m.add(time.step.ammount, time.step.unit)
	) {
		newAggr.push({ value: defaultValue, time: m.unix() * 1000 })
	}

	const prevAggrInInterval = prevAggr.filter(a => {
		const m = moment(a.time)
		return m.diff(time.interval.start) >= 0 && m.diff(time.interval.end) <= 0
	})

	const data = [...prevAggrInInterval, ...newAggr].reduce((data, a) => {
		const newData = { ...data }
		const value = data[a.time] || a.value || defaultValue
		newData[a.time] = value

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

import dateUtils from 'helpers/dateUtils'

export const fillEmptyTime = (
	prevAggr,
	timeframe,
	defaultValue = 0,
	period
) => {
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

	const prevAggrInInterval = prevAggr.filter(a => {
		const m = dateUtils.date(a.time)
		return (
			dateUtils.getDiff(m, time.interval.start) >= 0 &&
			dateUtils.getDiff(m, time.interval.end) <= 0
		)
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

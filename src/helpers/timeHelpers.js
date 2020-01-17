import moment from 'moment'

export const intervalsMs = {
	lastHour: {
		start: Date.now() - 60 * 60 * 1000,
		end: Date.now(),
	},
	last24Hours: {
		start: Date.now() - 24 * 60 * 60 * 1000,
		end: Date.now(),
	},
	thisWeek: {
		start: moment()
			.startOf('isoWeek')
			.valueOf(),
		end: moment()
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

export const fillEmptyTime = (prevAggr, timeframe) => {
	const time = {
		interval: intervalsMs.lastHour,
		step: { ammount: 1, unit: 'minute' },
	}
	switch (timeframe) {
		case 'hour':
			time.interval = intervalsMs.lastHour
			time.step = { ammount: 1, unit: 'minute' }
			break
		case 'day':
			time.interval = intervalsMs.last24Hours
			time.step = { ammount: 1, unit: 'hour' }
			break
		case 'week':
			time.interval = intervalsMs.lastWeek
			time.step = { ammount: 6, unit: 'hour' }
			break
		default:
			return prevAggr
	}
	const newAggr = []
	for (
		var m = moment(time.interval.start);
		m.isBefore(time.interval.end);
		m.add(time.step.ammount, time.step.unit)
	) {
		newAggr.push({ value: '0', time: m.unix() * 1000 })
	}
	const result = newAggr.map((item, i) => Object.assign({}, item, prevAggr[i]))
	return result
}

export const DATETIME_EXPORT_FORMAT = 'YYYY-MM-DD HH:mm:ss'

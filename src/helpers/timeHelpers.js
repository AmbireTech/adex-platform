import moment from 'moment'

export const intervalsMs = {
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

export const fillEmptyTime = (prevArgs, timeframe) => {
	// TODO: loop through based on timeframe
	// merge new and prev args
	// return
	// { label: 'LABEL_HOUR', value: 'hour' },
	// { label: 'LABEL_DAY', value: 'day' },
	// { label: 'LABEL_WEEK', value: 'week' },
	// { label: 'LABEL_MONTH', value: 'month' },
	// { label: 'LABEL_YEAR', value: 'year' },
	// for (var m = moment(a); m.isBefore(b); m.add(1, 'days')) {
	// 	console.log(m.format('YYYY-MM-DD'))
	// }
}

export const DATETIME_EXPORT_FORMAT = 'YYYY-MM-DD HH:mm:ss'

import moment from 'moment'

export const intervalsMs = {
	last24Hours: {
		start: Date.now() - (24 * 60 * 60 * 1000),
		end: Date.now()
	},
	thisWeek: {
		start: moment().startOf('isoWeek').valueOf(),
		end: moment().endOf('isoWeek').valueOf()
	},
	lastWeek: {
		start: moment().subtract(1, 'week').startOf('isoWeek').valueOf(),
		end: moment().subtract(1, 'week').endOf('isoWeek').valueOf()
	},
	thisMonth: {
		start: moment().startOf('month').valueOf(),
		end: moment().endOf('month').valueOf()
	},
	lastMonth: {
		start: moment().subtract(1, 'month').startOf('month').valueOf(),
		end: moment().subtract(1, 'month').endOf('month').valueOf()
	}
}

export const DATETIME_EXPORT_FORMAT = 'YYYY-MM-DD HH:mm:ss'

import MomentUtils from '@date-io/moment'
import moment from 'moment'

// We can't use the new version of @date-io/moment or @date-io/date-fns
// because the datepickers will crash, but we need some more functionality
// as adding hours and start / end of weeks. This is why I have created an
// extention class. We use this as MuiPickersUtilsProvider as well
export class DateUtils extends MomentUtils {
	startOfWeek(date) {
		return date.clone().startOf('week')
	}

	endOfWeek(date) {
		return date.clone().endOf('week')
	}

	isWithinInterval(date, { start, end }) {
		return date.clone().isBetween(start, end, null, '[]')
	}

	addHours(date, hours) {
		return date.clone().add(hours, 'hour')
	}

	startOf(date, period) {
		return date.clone().startOf(period)
	}

	endOf(date, period) {
		return date.clone().endOf(period)
	}

	addWeeks(date, weeks) {
		return date.clone().add(weeks, 'week')
	}
}

const utils = new DateUtils()

export default utils

export function makeJSDateObject(date) {
	if (moment.isMoment(date)) {
		return date.clone()
	}

	if (date instanceof Date) {
		return new Date(date.getTime())
	}

	return date
}

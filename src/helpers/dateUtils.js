import MomentUtils from '@date-io/moment'
import moment from 'moment'

class DateUtils extends MomentUtils {
	startOfWeek(date) {
		return date.clone().startOf('week')
	}

	endOfWeek(date) {
		return date.clone().endOf('week')
	}

	isWithinInterval(date, { start, end }) {
		return date.clone().isBetween(start, end, null, '[]')
	}
}

const utils = new DateUtils()

export default utils

export function makeJSDateObject(date) {
	// if (date instanceof dayjs) {
	// 	return date.clone().toDate()
	// }

	if (moment.isMoment(date)) {
		return date.clone()
	}

	// if (date instanceof DateTime) {
	// 	return date.toJSDate()
	// }

	if (date instanceof Date) {
		return new Date(date.getTime())
	}

	return date // handle case with invalid input
}

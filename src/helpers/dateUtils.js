import MomentUtils from '@date-io/moment'
import moment from 'moment'
import 'moment/min/locales'

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

	add(date, ammount, unit) {
		return date.add(ammount, unit)
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

	addMonths(date, months) {
		return date.clone().add(months, 'month')
	}

	getUTCOffset(date = this.moment()) {
		return this.moment(date).utcOffset() / 60
	}

	getUnix(date) {
		return date.unix()
	}
	getLocaleDate(locale) {
		return this.moment.localeData(locale)
	}

	updateLocale({ locale = 'en', dow, doy }) {
		const defaultLocaleData = this.getLocaleDate(locale)
		this.moment.updateLocale(locale, {
			week: {
				dow: dow || defaultLocaleData.firstDayOfWeek(),
				doy: doy || defaultLocaleData.firstDayOfYear(),
			},
		})
	}

	getNearestSixHoursUTC(hoursToRound, date) {
		const now = dateUtils.date(date)
		const hoursMulti = Math.floor(dateUtils.getHours(now) / hoursToRound)
		const nearestSix = dateUtils.setHours(
			now,
			hoursMulti * hoursToRound + dateUtils.getUTCOffset(now)
		)
		return dateUtils.setMinutes(dateUtils.setSeconds(nearestSix, 0), 0)
	}
}

export function makeJSDateObject(date) {
	if (moment.isMoment(date)) {
		return date.clone()
	}

	if (date instanceof Date) {
		return new Date(date.getTime())
	}

	return date
}

const dateUtils = new DateUtils()
dateUtils.updateLocale({
	dow: dateUtils
		.getLocaleDate(window.navigator.language.toLowerCase())
		.firstDayOfWeek(),
})

export default dateUtils

import MomentUtils from '@date-io/moment'
import moment from 'moment'
import 'moment/min/locales'

// We can't use the new version of @date-io/moment or @date-io/date-fns
// because the datepickers will crash, but we need some more functionality
// as adding hours and start / end of weeks. This is why I have created an
// extention class. We use this as MuiPickersUtilsProvider as well
export class DateUtils extends MomentUtils {
	startOfMinute(date) {
		return date.clone().startOf('minute')
	}

	startOfHour(date) {
		return date.clone().startOf('hour')
	}

	startOfWeek(date) {
		return date.clone().startOf('week')
	}

	startOfYear(date) {
		return date.clone().startOf('year')
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

	addMinutes(date, minutes) {
		return date.clone().add(minutes, 'minute')
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

	addYears(date, years) {
		return date.clone().add(years, 'year')
	}

	getUTCOffset(date = this.moment()) {
		return this.moment(date).utcOffset() / 60
	}

	getUTCOffsetFormatted(date = this.moment()) {
		const offset = this.moment(date).utcOffset()
		const sign = offset >= 0 ? '+' : '-'
		const hours = Math.abs(Math.floor(offset / 60)).toString()
		const minutes = (offset % 60).toString()

		return `${sign}${hours.length === 1 ? '0' + hours : hours}:${
			minutes.length === 1 ? '0' + minutes : minutes
		}`
	}

	getCurrentTimezone(date) {
		return new window.Intl.DateTimeFormat(date).resolvedOptions().timeZone
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

	getHourSpanStart(date, span) {
		const current = dateUtils.date(date)
		const hour = dateUtils.getHours(current)
		const spanStartHour = Math.floor(hour - (hour % span))
		const withSpanStartHour = dateUtils.setHours(current, spanStartHour)

		return dateUtils.startOfHour(withSpanStartHour)
	}

	format(date, formatString) {
		return this.moment(date).format(formatString)
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

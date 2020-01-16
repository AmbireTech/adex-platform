import moment from 'moment'

export function isOverlapping(startDate, endDate, dateRange) {
	const startDate1 = moment(startDate)
	const endDate1 = moment(endDate)
	const startDate2 = moment(dateRange.startDate)
	const endDate2 = moment(dateRange.endDate)
	const result = moment
		.max(startDate1, startDate2)
		.isBefore(moment.min(endDate1, endDate2))
	return result
}

export function isBetween(date, dateRange) {
	if (dateRange.startDate && dateRange.endDate)
		return moment(date).isBetween(dateRange.startDate, dateRange.endDate)
	else return true
}

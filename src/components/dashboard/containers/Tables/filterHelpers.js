import moment from 'moment'

const isOverlapping = (startDate, endDate, dateRange) => {
	const startDate1 = moment(startDate)
	const endDate1 = moment(endDate)
	const startDate2 = moment(dateRange.startDate)
	const endDate2 = moment(dateRange.endDate)
	const result = moment
		.max(startDate1, startDate2)
		.isBefore(moment.min(endDate1, endDate2))
	return result
}

const isBetween = (date, dateRange) => {
	if (dateRange.startDate && dateRange.endDate)
		return moment(date).isBetween(dateRange.startDate, dateRange.endDate)
	else return true
}

const desc = (a, b, orderBy, numeric, orderIsDate) => {
	const subCategories = orderBy.split('.')
	subCategories.forEach(prop => {
		a = a[prop]
		b = b[prop]
	})
	if (orderIsDate) {
		a = moment(a).unix()
		b = moment(b).unix()
	}

	if (!orderIsDate && numeric) {
		a = Number(a)
		b = Number(b)
	}

	if (b < a) return -1
	if (b > a) return 1
	return 0
}

const filterBySearch = (items, search) => {
	return items.filter(
		item =>
			(item.title && item.title.toLowerCase().includes(search.toLowerCase())) ||
			(item.description &&
				item.description.toLowerCase().includes(search.toLowerCase())) ||
			(item.type && item.type.toLowerCase().includes(search.toLowerCase())) ||
			(item.status &&
				item.status.name &&
				item.status.name.toLowerCase().includes(search.toLowerCase())) ||
			(item.id && item.id.toLowerCase() === search.toLowerCase())
		// We can search on more fields as well
	)
}

const filterByTags = (items, filters, itemType) => {
	const filtered = items.filter(item => {
		const tag =
			itemType === 'Campaign'
				? item.status && item.status.humanFriendlyName
					? item.status.humanFriendlyName.toLowerCase()
					: 'pending'
				: item.type.toLowerCase()

		return !!filters[tag]
	})

	return filtered
}

const filterByDate = (items, dateRange) => {
	return items.filter(
		item => isBetween(item.created, dateRange)
		// In campaigns we can search date for overlapping period between Starts Ends
		// searchOverlap && isOverlapping(item.activeFrom, item.withdrawPeriodStart, dateRange))
	)
}

const stableSort = (array, cmp) => {
	const stabilizedThis = array.map((el, index) => [el, index])
	stabilizedThis.sort((a, b) => {
		const order = cmp(a[0], b[0])
		if (order !== 0) return order
		return a[1] - b[1]
	})
	return stabilizedThis.map(el => el[0])
}

const getSorting = (order, orderBy, orderisNumber, orderIsDate) => {
	return order === 'desc'
		? (a, b) => desc(a, b, orderBy, orderisNumber, orderIsDate)
		: (a, b) => -desc(a, b, orderBy, orderisNumber, orderIsDate)
}

export { filterBySearch, filterByTags, filterByDate, stableSort, getSorting }

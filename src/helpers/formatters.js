import { utils } from 'ethers'
import MomentUtils from '@date-io/moment'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

const moment = new MomentUtils()
//TODO: use dateUtils

export const DEFAULT_DATETIME_FORMAT = 'YYYY/MM/DD HH:mm'
export const DEFAULT_DATE_FORMAT = 'YYYY/MM/DD'

export const formatDateTime = (
	timestamp,
	format = DEFAULT_DATETIME_FORMAT,
	noDateLabel = 'no date'
) => {
	if (!timestamp) {
		return noDateLabel
	}
	const date = moment.date(timestamp)
	return date.format(format)
}

export const formatDate = (
	timestamp,
	format = DEFAULT_DATE_FORMAT,
	noDateLabel = 'no date'
) => {
	if (!timestamp) {
		return noDateLabel
	}
	const date = moment.date(timestamp)
	return date.format(format)
}

export const formatTokenAmount = (
	amountString = '0',
	decimals = 18,
	pretty,
	toFixed
) => {
	const formatted = utils.formatUnits(amountString, decimals)
	if (pretty) {
		return utils.commify(
			typeof toFixed === 'number'
				? parseFloat(formatted).toFixed(toFixed)
				: formatted
		)
	} else if (typeof toFixed === 'number') {
		// We want truncated not rounded
		return parseFloat(formatted)
			.toFixed(toFixed + 4)
			.slice(0, -4)
	} else {
		return formatted
	}
}

export const formatAddress = (address = '', joinSymbol = '...') => {
	return `${address.substring(0, 8)}${joinSymbol}${address.substring(36, 42)}`
}

export const formatNumberWithCommas = x => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const formatFloatNumberWithCommas = x => {
	const parts = x.toString().split('.')
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	return parts.join('.')
}

export const formatNumberWithoutCommas = x => {
	return x
		.toString()
		.split(',')
		.join('')
}

export const toFixedFloat = (number, decimals = 2) => {
	const num = parseFloat(parseFloat(number).toFixed(decimals))

	return num
}

export const formatAbbrNum = (number, decPlaces) => {
	// 2 decimal places => 100, 3 => 1000, etc
	decPlaces = Math.pow(10, decPlaces)

	// Enumerate number abbreviations
	var abbrev = ['k', 'm', 'b', 't']

	// Go through the array backwards, so we do the largest first
	for (var i = abbrev.length - 1; i >= 0; i--) {
		// Convert array index to "1000", "1000000", etc
		var size = Math.pow(10, (i + 1) * 3)

		// If the number is bigger or equal do the abbreviation
		if (size <= number) {
			// Here, we multiply by decPlaces, round, and then divide by decPlaces.
			// This gives us nice rounding to a particular decimal place.
			number = Math.round((number * decPlaces) / size) / decPlaces

			// Handle special case where we round up to the next abbreviation
			if (number === 1000 && i < abbrev.length - 1) {
				number = 1
				i++
			}

			// Add the letter for the abbreviation
			number += abbrev[i]

			// We are done... stop
			break
		}
	}

	return number
}

export const truncateString = (string, maxLength = 50) => {
	if (!string) return ''
	if (string.length <= maxLength) return string
	return `${string.substring(0, maxLength).trim()}...`
}

export const timeSinceEpoch = (
	epochDivider = 2628000000,
	start = Date.now(),
	end = Date.now()
) => {
	const epoch = Math.floor(start / epochDivider)
	const epochStart = Math.floor(epoch * epochDivider)

	const period = end - epochStart

	const periodDays = period / DAY

	if (periodDays < 1) {
		const hours = Math.floor(periodDays * 24)
		return [hours, hours > 1 ? 'HOURS' : 'HOUR']
	} else {
		const days = Math.floor(periodDays)
		return [days, days > 1 ? 'DAYS' : 'DAY']
	}
}

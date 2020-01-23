import { formatUnits, commify } from 'ethers/utils'
import MomentUtils from '@date-io/moment'
const moment = new MomentUtils()

const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm'

export const formatDateTime = (timestamp, format = DEFAULT_DATETIME_FORMAT) => {
	if (!timestamp) {
		return 'no date'
	}
	const date = moment.date(timestamp)
	return date.format(format)
}

export const formatTokenAmount = (
	amountString,
	decimals = 18,
	pretty,
	toFixed
) => {
	const formatted = formatUnits(amountString, decimals)
	if (pretty) {
		return commify(formatted)
	} else if (typeof toFixed === 'number') {
		return parseFloat(formatted).toFixed(toFixed)
	} else {
		return formatted
	}
}

export const formatAddress = (address = '') => {
	return `${address.substring(0, 8)}...${address.substring(36, 42)}`
}

export const formatNumberWithCommas = x => {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const formatNumberWithoutCommas = x => {
	return x.toString().replace(',', '')
}

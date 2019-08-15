import queryString from 'query-string'
import { UTM_ATTRIBUTES, UTM_DEFAULT_VALUE } from 'constants/misc'

export const addUrlUtmTracking = (targetUrl, source, medium, campaign, content) => {
	const url = targetUrl.split('?')
	const params = queryString.parse(url[1])
	params[UTM_ATTRIBUTES.SOURCE] = source ? source : UTM_DEFAULT_VALUE.SOURCE
	params[UTM_ATTRIBUTES.MEDIUM] = medium ? medium :UTM_DEFAULT_VALUE.MEDIUM
	params[UTM_ATTRIBUTES.CAMPAIGN] = campaign ? campaign : UTM_DEFAULT_VALUE.CAMPAIGN
	params[UTM_ATTRIBUTES.CONTENT] = content ? content : UTM_DEFAULT_VALUE.CONTENT
	const qs = queryString.stringify(params)
	return url[0].concat('?', qs);
}
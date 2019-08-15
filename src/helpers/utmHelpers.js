import url from 'url';
import { UTM_ATTRIBUTES, UTM_DEFAULT_VALUE } from 'constants/misc'

export const addUrlUtmTracking = (targetUrl, source, medium, campaign, content) => {
	if (!!targetUrl) {
		const URL = url.parse(targetUrl, true)
		if (URL.protocol && URL.host) {
			URL.query = {
				[UTM_ATTRIBUTES.SOURCE]: (source ? source : UTM_DEFAULT_VALUE.SOURCE),
				[UTM_ATTRIBUTES.MEDIUM]: (medium ? medium : UTM_DEFAULT_VALUE.MEDIUM),
				[UTM_ATTRIBUTES.CAMPAIGN]: (campaign ? campaign : UTM_DEFAULT_VALUE.CAMPAIGN),
				[UTM_ATTRIBUTES.CONTENT]: (content ? content : UTM_DEFAULT_VALUE.CONTENT),
			}
			delete URL.search
			return url.format(URL)
		}
	}
	return targetUrl;
}
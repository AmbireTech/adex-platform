import url from 'url';
import { UTM_ATTRIBUTES, UTM_DEFAULT_VALUE } from 'constants/misc'

export const addUrlUtmTracking = ({ targetUrl, campaign, content, removeFromUrl }) => {
	if (!!targetUrl) {
		const URL = url.parse(targetUrl, true)
		delete URL.search
		if (URL.protocol && URL.host) {
			if (removeFromUrl) {
				URL.query[UTM_ATTRIBUTES.SOURCE] === UTM_DEFAULT_VALUE.SOURCE
					&& delete URL.query[UTM_ATTRIBUTES.SOURCE]
				URL.query[UTM_ATTRIBUTES.MEDIUM] === UTM_DEFAULT_VALUE.MEDIUM
					&& delete URL.query[UTM_ATTRIBUTES.MEDIUM]
				URL.query[UTM_ATTRIBUTES.CAMPAIGN] === UTM_DEFAULT_VALUE.CAMPAIGN
					&& delete URL.query[UTM_ATTRIBUTES.CAMPAIGN]
				URL.query[UTM_ATTRIBUTES.CONTENT] === UTM_DEFAULT_VALUE.CONTENT
					&& delete URL.query[UTM_ATTRIBUTES.CONTENT]
				return url.format(URL)
			}
			const utmParams = {
				//This will not remove custom added source and medium
				[UTM_ATTRIBUTES.SOURCE]: (URL.query[UTM_ATTRIBUTES.SOURCE] ? 
					URL.query[UTM_ATTRIBUTES.SOURCE] : UTM_DEFAULT_VALUE.SOURCE),
				[UTM_ATTRIBUTES.MEDIUM]: (URL.query[UTM_ATTRIBUTES.MEDIUM] ? 
					URL.query[UTM_ATTRIBUTES.MEDIUM] : UTM_DEFAULT_VALUE.MEDIUM),
				[UTM_ATTRIBUTES.CAMPAIGN]: (campaign ? campaign : UTM_DEFAULT_VALUE.CAMPAIGN),
				[UTM_ATTRIBUTES.CONTENT]: (content ? content : UTM_DEFAULT_VALUE.CONTENT),
			}
			URL.query = { ...URL.query, ...utmParams }
			return url.format(URL)
		}
	}
	return targetUrl;
}
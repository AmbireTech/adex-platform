import url from 'url'
import { UTM_PARAMS } from 'constants/misc'

export const addUrlUtmTracking = ({ targetUrl, campaign, content, removeFromUrl }) => {
	if (!!targetUrl) {
		const URL = url.parse(targetUrl, true)
		URL.search = null

		if (URL.protocol && URL.host) {
			const newQuery = {}
			if (removeFromUrl) {
				for (let [key, value] of Object.entries(URL.query)) {
					if (UTM_PARAMS[key] !== value) {
						newQuery[key] = value
					}
				}				
				URL.query = newQuery
			} else {
				const query = { ...UTM_PARAMS, ...URL.query }

				if (campaign) {
					query['utm_campaign'] = campaign
				}
				if (content) {
					query['utm_content'] = content
				}
				URL.query = query
			}
			return url.format(URL)
		}
	}

	return targetUrl
}
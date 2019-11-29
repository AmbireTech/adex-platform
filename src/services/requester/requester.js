import Helper from 'helpers/miscHelpers'
import { getState } from 'actions'
import { selectAuthSig } from 'selectors'
import { isDemoMode } from 'services/store-data/auth'

class AdexNodeRequester {
	constructor({ baseUrl }) {
		this.baseUrl = baseUrl
	}

	getAuthHeaders = ({ authSig } = {}) => {
		const authSignature = selectAuthSig(getState())
		return {
			'X-User-Signature': authSig || authSignature,
		}
	}

	noCacheHeaders = {
		'Cache-Control': 'no-cache',
		Expires: '0',
		Pragma: 'no-cache',
	}

	getUrl = (base, route, query) => {
		let url = base + '/'
		if (route) {
			route = route.replace(/^\//, '')
			url += route
		}

		url += query

		return url
	}

	fetch = ({
		route = '',
		queryParams = {},
		method = 'GET',
		body,
		headers = {},
		userAddr,
		authSig = '',
		authToken,
		noCache = false,
	}) => {
		const qp = { ...queryParams }
		if (isDemoMode()) {
			qp.demo = true
		}

		const query = Helper.getQuery(qp)
		const url = this.getUrl(this.baseUrl, route, query)

		const hdrs = {
			...(noCache ? this.noCacheHeaders : {}),
			...this.getAuthHeaders({ authSig }),
			...headers,
		}
		return fetch(url, {
			method: method,
			headers: hdrs,
			body: body,
		})
	}
}

export default AdexNodeRequester

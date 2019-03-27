import Requester from 'services/requester'

const ADEX_MARKET_HOST = process.env.ADEX_MARKET_HOST

const requester = new Requester({ baseUrl: ADEX_MARKET_HOST })

const processResponse = (res) => {

	if (res.status >= 200 && res.status < 400) {
		return res.json()
	} else {
		return res.text()
			.then((text) => {
				throw new Error(JSON.stringify({ status: res.status, error: res.statusText + ' - ' + text }))
			})
	}
}

export const getSession = ({ identity, mode, signature, authToken, hash, typedData, signerAddress }) => {
	return requester.fetch({
		route: 'auth/',
		method: 'POST',
		body: JSON.stringify({
			identity,
			mode,
			signature,
			authToken,
			hash,
			typedData,
			signerAddress
		}),
		headers: { 'Content-Type': 'application/json' }
	})
		.then(processResponse)
}

export const checkSession = ({ authSig, skipErrToast }) => {
	return requester.fetch({
		route: 'session/grant-account',
		method: 'POST',
		authSig,
		skipErrToast
	})
		.then(processResponse)
}
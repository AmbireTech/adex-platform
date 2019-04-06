import Requester from 'services/requester'
import moment from 'moment'
import { logOut } from 'services/store-data/auth'
import { execute } from 'actions/common'
import { addToast } from 'actions/uiActions'
import { translate } from 'services/translations/translations'

const ADEX_MARKET_HOST = process.env.ADEX_MARKET_HOST

const requester = new Requester({ baseUrl: ADEX_MARKET_HOST })

const processResponse = (res) => {

	if (res.status >= 200 && res.status < 400) {
		return res.json()
	} else {
		return res.text()
			.then((text) => {
				if (res.status === 401 || res.status === 403) {
					logOut()
					execute(
						addToast({
							type: 'cancel',
							action: 'X',
							label: translate(
								'ERR_AUTH',
								{
									args: [res.statusText + ' - ' + text]
								}), timeout: 5000
						}))
				}
				throw new Error(JSON.stringify({
					status: res.status,
					error: res.statusText + ' - ' + text
				}))
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
		route: 'session',
		method: 'GET',
		authSig,
		skipErrToast
	})
		.then(processResponse)
}

export const uploadImage = ({ imageBlob, imageName = '', authSig }) => {
	const formData = new FormData()
	formData.append('media', imageBlob, imageName)
	return requester.fetch({
		route: 'image',
		method: 'POST',
		body: formData,
		authSig
	})
		.then(processResponse)
}

const convertItemToJSON = (item) => {
	const itemToConvert = { ...item }
	if (itemToConvert.created && moment.isMoment(itemToConvert.created)) {
		itemToConvert.created = moment.unix(itemToConvert.created) / 1000
	}

	return JSON.stringify(itemToConvert)
}

export const getAdUnits = ({ authSig }) => {
	// TODO: validate with adex-models schema

	return requester.fetch({
		route: 'adunits',
		method: 'GET',
		authSig
	})
		.then(processResponse)
}

export const postAdUnit = ({ unit, authSig }) => {
	// TODO: validate with adex-models schema

	return requester.fetch({
		route: 'adunits',
		method: 'POST',
		body: convertItemToJSON(unit),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	})
		.then(processResponse)
}

export const updateAdUnit = ({ unit, authSig }) => {
	// TODO: validate with adex-models schema

	return requester.fetch({
		route: 'adunits',
		method: 'PUT',
		body: convertItemToJSON(unit),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	})
		.then(processResponse)
}

export const getAdSlots = ({ authSig }) => {
	// TODO: validate with adex-models schema

	return requester.fetch({
		route: 'adslots',
		method: 'GET',
		authSig
	})
		.then(processResponse)
}

export const postAdSlot= ({ slot, authSig }) => {
	// TODO: validate with adex-models schema

	return requester.fetch({
		route: 'adslots',
		method: 'POST',
		body: convertItemToJSON(slot),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	})
		.then(processResponse)
}

export const updateAdSlot= ({ slot, authSig }) => {
	// TODO: validate with adex-models schema

	return requester.fetch({
		route: 'adslots',
		method: 'PUT',
		body: convertItemToJSON(slot),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	})
		.then(processResponse)
}

export const 








import Requester from 'services/requester'
import moment from 'moment'
import { logOut } from 'services/store-data/auth'
import { execute } from 'actions/common'
import { addToast } from 'actions/uiActions'
import { translate } from 'services/translations/translations'

const ADEX_MARKET_HOST = process.env.ADEX_MARKET_HOST

const requester = new Requester({ baseUrl: ADEX_MARKET_HOST })

const processResponse = (response) => {

	return response
		.then(res => {
			console.log('res', res)
			if (res.status >= 200 && res.status < 400) {
				return res.json()
			}
			else {
				return res
					.text()
					.then(text => {
						if (res.status === 401 || res.status === 403) {
							// logOut()
						}
						throw new Error(
							`status: ${res.status}`,
							`error: ${res.statusText}-${text}`
						)
					})
			}

		})
		.catch(err => {
			execute(
				addToast({
					type: 'cancel',
					action: 'X',
					label: err || translate(
						'ERR_MARKET_REQUEST',
						{
							args: [err]
						}),
					timeout: 50000
				}))
		})
}

export const getSession = ({ identity, mode, signature, authToken, hash, typedData, signerAddress }) => {
	return processResponse(requester.fetch({
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
	}))
}

export const checkSession = ({ authSig, skipErrToast }) => {
	return processResponse(requester.fetch({
		route: 'session',
		method: 'GET',
		authSig,
		skipErrToast
	}))
}

export const uploadImage = ({ imageBlob, imageName = '', authSig }) => {
	const formData = new FormData()
	formData.append('media', imageBlob, imageName)
	return processResponse(requester.fetch({
		route: 'media',
		method: 'POST',
		body: formData,
		authSig
	}))
}

const convertItemToJSON = (item) => {
	const itemToConvert = { ...item }
	if (itemToConvert.created && moment.isMoment(itemToConvert.created)) {
		itemToConvert.created = moment.unix(itemToConvert.created) / 1000
	}

	return JSON.stringify(itemToConvert)
}

export const getAdUnits = ({ authSig }) => {
	return processResponse(requester.fetch({
		route: 'adunits',
		method: 'GET',
		authSig
	}))
}

export const postAdUnit = ({ unit, authSig }) => {
	return processResponse(requester.fetch({
		route: 'adunits',
		method: 'POST',
		body: convertItemToJSON(unit),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	}))
}

export const updateAdUnit = ({ unit, authSig }) => {
	return processResponse(requester.fetch({
		route: 'adunits',
		method: 'PUT',
		body: convertItemToJSON(unit),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	}))
}

export const getAdSlots = ({ authSig }) => {
	return processResponse(requester.fetch({
		route: 'adslots',
		method: 'GET',
		authSig
	}))
}

export const postAdSlot = ({ slot, authSig }) => {
	return processResponse(requester.fetch({
		route: 'adslots',
		method: 'POST',
		body: convertItemToJSON(slot),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	}))
}

export const updateAdSlot = ({ slot, authSig }) => {
	return processResponse(requester.fetch({
		route: 'adslots',
		method: 'PUT',
		body: convertItemToJSON(slot),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	}))
}

export const getCampaigns = ({ authSig }) => {
	return processResponse(requester.fetch({
		route: 'campaigns',
		method: 'GET',
		authSig
	}))
}
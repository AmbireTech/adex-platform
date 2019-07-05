import Requester from 'services/requester'
import { logOut } from 'services/store-data/auth'
import moment from 'moment'
import { translate } from 'services/translations/translations'

const ADEX_MARKET_HOST = process.env.ADEX_MARKET_HOST
const requester = new Requester({ baseUrl: ADEX_MARKET_HOST })

const processResponse = (res, dontThrow) => {
	if (res.status >= 200 && res.status < 400) {
		return res.json()
	}

	return res
		.text()
		.then(text => {
			if (res.status === 401 || res.status === 403) {
				logOut()
			}
			if (!dontThrow) {
				throw new Error(
					translate('SERVICE_ERROR_MSG',
						{
							args: [
								res.url,
								res.status,
								res.statusText,
								text
							]
						}))
			}
		})
}

export const getSession = ({
	identity,
	mode,
	signature,
	authToken,
	hash,
	typedData,
	signerAddress }) => {
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
	}).then(processResponse)
}

export const checkSession = ({ authSig, skipErrToast }) => {
	return requester.fetch({
		route: 'session',
		method: 'GET',
		authSig,
		skipErrToast
	}).then((res) => processResponse(res, true))
}

export const uploadImage = ({ imageBlob, imageName = '', authSig }) => {
	const formData = new FormData()
	formData.append('media', imageBlob, imageName)
	return requester.fetch({
		route: 'media',
		method: 'POST',
		body: formData,
		authSig
	}).then(processResponse)
}

const convertItemToJSON = (item) => {
	const itemToConvert = { ...item }
	if (itemToConvert.created && moment.isMoment(itemToConvert.created)) {
		itemToConvert.created = moment.unix(itemToConvert.created) / 1000
	}

	return JSON.stringify(itemToConvert)
}

export const getAdUnits = ({ authSig }) => {
	return requester.fetch({
		route: 'units',
		method: 'GET',
		authSig
	}).then(processResponse)
}

export const postAdUnit = ({ unit, authSig }) => {
	return requester.fetch({
		route: 'units',
		method: 'POST',
		body: convertItemToJSON(unit),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	}).then(processResponse)
}

export const updateAdUnit = ({ unit, authSig }) => {
	return requester.fetch({
		route: 'units',
		method: 'PUT',
		body: convertItemToJSON(unit),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	}).then(processResponse)
}

export const getAdSlots = ({ authSig }) => {
	return requester.fetch({
		route: 'slots',
		method: 'GET',
		authSig
	}).then(processResponse)
}

export const postAdSlot = ({ slot, authSig }) => {
	return requester.fetch({
		route: 'slots',
		method: 'POST',
		body: convertItemToJSON(slot),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	}).then(processResponse)
}

export const updateAdSlot = ({ slot, authSig }) => {
	return requester.fetch({
		route: 'slots',
		method: 'PUT',
		body: convertItemToJSON(slot),
		authSig,
		headers: { 'Content-Type': 'application/json' }
	}).then(processResponse)
}

export const getCampaigns = ({ authSig }) => {
	return requester.fetch({
		route: 'campaigns/by-owner',
		method: 'GET',
		authSig
	}).then(processResponse)
}

export const getAllCampaigns = (all) => {
	const queryParams = all ? {
		all: true
	} : {}

	return requester.fetch({
		route: 'campaigns',
		method: 'GET',
		queryParams
	}).then(processResponse)
}
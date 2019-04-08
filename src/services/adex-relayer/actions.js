import Requester from 'services/requester'
import { execute } from 'actions/common'
import { addToast } from 'actions/uiActions'
import { translate } from 'services/translations/translations'

const ADEX_RELAYER_HOST = process.env.ADEX_RELAYER_HOST

const requester = new Requester({ baseUrl: ADEX_RELAYER_HOST })

const processResponse = (response) => {

	return response
		.then(res => {
			console.log('res', res)
			if ( res.status >= 200 && res.status < 400) {
				return res.json()
			} else {
				return res
					.text()
					.then(text => {
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
						'ERR_RELAYER_REQUEST',
						{
							args: [err]
						}),
					timeout: 50000
				}))
		})
}

export const identityToEmail = ({ identity, privileges, mail }) => {
	return processResponse(requester.fetch({
		route: 'identity/info-mail',
		method: 'POST',
		body: JSON.stringify({
			identity,
			privileges,
			mail
		}),
		headers: { 'Content-Type': 'application/json' }
	}))
}

export const grantAccount = ({ ownerAddr, mail, couponCode }) => {
	return processResponse(requester.fetch({
		route: 'identity/grant-account',
		method: 'POST',
		body: JSON.stringify({
			mail,
			ownerAddr,
			couponCode
		}),
		headers: { 'Content-Type': 'application/json' }
	}))
}

export const checkCoupon = ({ coupon }) => {
	return processResponse(requester.fetch({
		route: `identity/valid-coupon/${coupon}`,
		method: 'GET'
	}))
}

export const getOwnerIdentities = ({ owner }) => {
	return processResponse(requester.fetch({
		route: `identity/owners/${owner}`,
		method: 'GET'
	}))
}

export const identityBytecode = ({ owner, privLevel, identityBaseAddr }) => {
	return processResponse(requester.fetch({
		route: 'identity/identity-bytecode',
		method: 'POST',
		body: JSON.stringify({
			owner,
			privLevel,
			identityBaseAddr
		}),
		headers: { 'Content-Type': 'application/json' }
	}))
}

export const registerFullIdentity = ({
	txHash, identity, privileges, mail }) => {
	return processResponse(requester.fetch({
		route: 'identity/register-identity',
		method: 'POST',
		body: JSON.stringify({
			txHash,
			identity,
			privileges,
			mail
		}),
		headers: { 'Content-Type': 'application/json' }
	}))
}
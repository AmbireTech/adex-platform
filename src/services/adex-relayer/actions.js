import Requester from 'services/requester'
import { translate } from 'services/translations/translations'

const ADEX_RELAYER_HOST = process.env.ADEX_RELAYER_HOST
const requester = new Requester({ baseUrl: ADEX_RELAYER_HOST })

const processResponse = res => {
	if (res.status >= 200 && res.status < 400) {
		return res.json()
	}

	return res.text().then(text => {
		throw new Error(
			translate('SERVICE_ERROR_MSG', {
				args: [res.url, res.status, res.statusText, text],
			})
		)
	})
}

export const getGrantType = ({ identity }) => {
	return requester
		.fetch({
			route: `identity/grant-type/${identity}`,
			method: 'GET',
		})
		.then(processResponse)
}

export const checkCoupon = ({ coupon }) => {
	return requester
		.fetch({
			route: `identity/valid-coupon/${coupon}`,
			method: 'GET',
		})
		.then(processResponse)
}

export const getOwnerIdentities = ({ owner }) => {
	return requester
		.fetch({
			route: `identity/by-owner/${owner}`,
			method: 'GET',
		})
		.then(processResponse)
}

export const getRelayerConfigData = () => {
	return requester
		.fetch({
			route: 'relayer/cfg',
			method: 'GET',
		})
		.then(processResponse)
}

export const executeTx = ({ txnsRaw, signatures, identityAddr, channel }) => {
	return requester
		.fetch({
			route: `identity/${identityAddr}/execute`,
			method: 'POST',
			body: JSON.stringify({
				txnsRaw,
				signatures,
				identityAddr,
				channel,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const regAccount = ({
	owner,
	email,
	bytecode,
	identityFactoryAddr,
	identityBaseAddr,
	salt,
	identityAddr,
	privileges,
}) => {
	return requester
		.fetch({
			route: 'identity/register',
			method: 'POST',
			body: JSON.stringify({
				owner,
				email,
				bytecode,
				identityFactoryAddr,
				identityBaseAddr,
				salt,
				identityAddr,
				privileges,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const getQuickWallet = ({ hash }) => {
	return requester
		.fetch({
			route: `wallet/${encodeURIComponent(hash)}`,
			method: 'GET',
		})
		.then(processResponse)
}

export const backupWallet = ({ email, salt, hash, encryptedWallet }) => {
	return requester
		.fetch({
			route: `wallet`,
			method: 'POST',
			body: JSON.stringify({
				email,
				salt,
				hash,
				encryptedWallet,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

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

export const identityToEmail = ({ identity, privileges, mail }) => {
	return requester
		.fetch({
			route: 'identity/info-mail',
			method: 'POST',
			body: JSON.stringify({
				identity,
				privileges,
				mail,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const grantAccount = ({ ownerAddr, mail, couponCode }) => {
	return requester
		.fetch({
			route: 'identity/grant-account',
			method: 'POST',
			body: JSON.stringify({
				mail,
				ownerAddr,
				couponCode,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
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

export const checkAccessCode = ({ code }) => {
	return requester
		.fetch({
			route: `identity/valid-accesscode/${code}`,
			method: 'GET',
		})
		.then(processResponse)
}

export const getOwnerIdentities = ({ owner }) => {
	return requester
		.fetch({
			route: `identity/owners/${owner}`,
			method: 'GET',
		})
		.then(processResponse)
}

export const identityBytecode = ({ owner, privLevel, identityBaseAddr }) => {
	return requester
		.fetch({
			route: 'identity/identity-bytecode',
			method: 'POST',
			body: JSON.stringify({
				owner,
				privLevel,
				identityBaseAddr,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const sendOpenChannel = ({
	txnsRaw,
	signatures,
	channel,
	identityAddr,
}) => {
	return requester
		.fetch({
			route: 'channel/open',
			method: 'POST',
			body: JSON.stringify({
				txnsRaw,
				signatures,
				channel,
				identityAddr,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const registerExpectedIdentity = ({ owner, mail }) => {
	return requester
		.fetch({
			route: 'identity/register-expected',
			method: 'POST',
			body: JSON.stringify({
				owner,
				mail,
			}),
			headers: { 'Content-Type': 'application/json' },
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

export const executeTx = ({ txnsRaw, signatures, identityAddr }) => {
	return requester
		.fetch({
			route: 'identity/execute',
			method: 'POST',
			body: JSON.stringify({
				txnsRaw,
				signatures,
				identityAddr,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

export const setAddrPriv = ({
	txnsRaw,
	signatures,
	identityAddr,
	privLevel,
	setAddr,
}) => {
	return requester
		.fetch({
			route: 'identity/set-addr-privilege',
			method: 'POST',
			body: JSON.stringify({
				txnsRaw,
				signatures,
				identityAddr,
				setAddr,
				privLevel,
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

export const quickWalletSalt = ({ email }) => {
	return requester
		.fetch({
			route: `wallet/salt/${encodeURIComponent(email)}`,
			method: 'GET',
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

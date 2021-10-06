import Requester, { handleRequesterErrorRes } from 'services/requester'
import { selectNetwork } from 'selectors'

const ADEX_RELAYER_HOST = process.env.ADEX_RELAYER_HOST
const requester = new Requester({ baseUrl: ADEX_RELAYER_HOST })

const processResponse = res => {
	if (res.status >= 200 && res.status < 400) {
		return res.json()
	}

	return res.text().then(text => {
		handleRequesterErrorRes({ res, text })
	})
}

export const getOwnerIdentities = ({ owner, networkId }) => {
	const network = networkId || selectNetwork().id
	return requester
		.fetch({
			route: `identity/${network}/by-owner/${owner}`,
			method: 'GET',
		})
		.then(processResponse)
}

export const getIdentityData = ({ identityAddr, networkId }) => {
	const network = networkId || selectNetwork().id
	return requester
		.fetch({
			route: `identity/${network}/${identityAddr}`,
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
	knowFrom,
	userSide,
	moreInfo,
	bytecode,
	identityFactoryAddr,
	baseIdentityAddr,
	salt,
	identityAddr,
	privileges,
	routineAuthorizationsRaw,
}) => {
	return requester
		.fetch({
			route: `identity/${identityAddr}`,
			method: 'POST',
			body: JSON.stringify({
				owner,
				email,
				knowFrom,
				userSide,
				moreInfo,
				bytecode,
				identityFactoryAddr,
				baseIdentityAddr,
				salt,
				identityAddr,
				privileges,
				routineAuthorizationsRaw,
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

export const getEmail = ({ email }) => {
	return requester
		.fetch({
			route: `identity/email/${encodeURIComponent(email)}`,
			method: 'GET',
		})
		.then(processResponse)
}

export const resendEmail = ({ email }) => {
	return requester
		.fetch({
			route: `identity/email/${encodeURIComponent(email)}/resend`,
			method: 'GET',
		})
		.then(processResponse)
}

export const getTransactionsEstimateData = ({
	identityAddr,
	networkId,
	txns,
}) => {
	const network = networkId || selectNetwork().id
	return requester
		.fetch({
			route: `identity/${identityAddr}/${network}/estimate`,
			method: 'post',
			body: JSON.stringify({
				txns,
			}),
			headers: { 'Content-Type': 'application/json' },
		})
		.then(processResponse)
}

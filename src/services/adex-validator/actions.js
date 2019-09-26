import Requester from 'services/requester'
import { translate } from 'services/translations/translations'
import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner } from 'services/smart-contracts/actions/ethers'
import ewt from './ewt'

const BEARER_PREFIX = 'Bearer '

const getRequesters = ({ campaign }) => {
	const leader = (campaign.validators || campaign.spec.validators)[0]
	const follower = (campaign.validators || campaign.spec.validators)[1]
	const leaderRequester = new Requester({ baseUrl: leader.url })
	const followerRequester = new Requester({ baseUrl: follower.url })

	return {
		leader: { requester: leaderRequester, validator: leader },
		follower: { requester: followerRequester, validator: follower },
	}
}

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

export const getValidatorAuthToken = async ({ validatorId, account }) => {
	const { identity, wallet } = account
	const existingAuth = (identity.validatorAuthTokens || {})[validatorId]
	if (existingAuth) {
		return existingAuth
	}

	const { provider } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })

	const payload = {
		id: validatorId,
		identity: identity.address,
		era: Math.floor(Date.now() / 60000),
	}

	const token = ewt.sign(signer, payload)

	return token
}

const sendMessage = async ({ campaign, options, account }) => {
	const { follower, leader } = getRequesters({ campaign })

	const followerAuthToken = await getValidatorAuthToken({
		validatorId: follower.validator.id,
		account,
	})
	const leaderAuthToken = await getValidatorAuthToken({
		validatorId: leader.validator.id,
		account,
	})
	const followerResult = await follower.requester
		.fetch({
			...options,
			headers: {
				...options.headers,
				authorization: BEARER_PREFIX + followerAuthToken,
			},
		})
		.then(processResponse)

	const leaderResult = await leader.requester
		.fetch({
			...options,
			headers: {
				...options.headers,
				authorization: BEARER_PREFIX + leaderAuthToken,
			},
		})
		.then(processResponse)

	return {
		results: {
			followerResult,
			leaderResult,
		},
		authTokens: {
			[follower.id]: followerAuthToken,
			[leader.id]: leaderAuthToken,
		},
	}
}

export const lastApprovedState = ({ campaign }) => {
	const { leader } = getRequesters({ campaign })

	return leader.requester
		.fetch({
			route: `channel/${campaign.id}/last-approved`,
			method: 'GET',
		})
		.then(processResponse)
}

export const closeCampaign = ({ campaign, account }) => {
	const options = {
		route: `channel/${campaign.id}/events`,
		method: 'POST',
		body: JSON.stringify({ events: [{ type: 'CLOSE' }] }),
		headers: { 'Content-Type': 'application/json' },
	}

	return sendMessage({ campaign, options, account })
}

export const eventsAggregates = async ({
	agrArgs,
	campaign,
	validatorsAuth,
}) => {
	const { follower } = getRequesters({ campaign })
	const followerId = follower.validator.id

	const aggregates = await follower.requester
		.fetch({
			route: `channel/${campaign.id}/events-aggregates/${agrArgs}`,
			method: 'GET',
			headers: { authorization: BEARER_PREFIX + validatorsAuth[follower.id] },
		})
		.then(processResponse)

	return {
		authTokens: {
			[followerId]: validatorsAuth[followerId],
		},
		aggregates,
	}
}

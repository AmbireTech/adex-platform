import * as types from 'constants/actionTypes'
import throttle from 'lodash.throttle'
import { addToast, removeToast, updateSpinner } from 'actions'
import { translate } from 'services/translations/translations'
import {
	getValidatorAuthToken,
	identityAnalytics,
	identityCampaignsAnalytics,
} from 'services/adex-validator/actions'
import { updateValidatorAuthTokens } from './accountActions'
import {
	VALIDATOR_ANALYTICS_EVENT_TYPES,
	VALIDATOR_ANALYTICS_METRICS,
} from 'constants/misc'
import { UPDATING_SLOTS_DEMAND } from 'constants/spinners'
import { getErrorMsg } from 'helpers/errors'
import { fillEmptyTime } from 'helpers/timeHelpers'
import { getUnitsStatsByType } from 'services/adex-market/aggregates'
import { selectChannelsWithUserBalancesAll } from 'selectors'
import { bigNumberify } from 'ethers/utils'

const VALIDATOR_LEADER_ID = process.env.VALIDATOR_LEADER_ID

const analyticsParams = (timeframe, side) => {
	const callsParams = []

	VALIDATOR_ANALYTICS_EVENT_TYPES.forEach(eventType =>
		VALIDATOR_ANALYTICS_METRICS.forEach(metric =>
			callsParams.push({
				metric,
				timeframe,
				side,
				eventType,
				...(side === 'publisher' &&
					metric === 'eventPayouts' && { segmentByChannel: true }),
			})
		)
	)

	return callsParams
}

const analyticsCampaignsParams = () => {
	const callsParams = []
	VALIDATOR_ANALYTICS_EVENT_TYPES.forEach(eventType =>
		callsParams.push({ eventType })
	)
	return callsParams
}

// getIdentityStatistics tooks to long some times
// if the account is change we do not update the account
// TODO: we can use something for abortable tasks
function checkAccountChanged(getState, account) {
	const accountCheck = getState().persist.account
	const accountChanged =
		!accountCheck.wallet.address ||
		accountCheck.wallet.address !== account.wallet.address ||
		!accountCheck.identity.address ||
		!accountCheck.identity.address !== !account.identity.address

	return accountChanged
}

function aggrByChannelsSegments(aggr, channels) {
	return Object.values(
		aggr.reduce((data, a) => {
			const c = channels[a.channelId.toLowerCase()] || {}
			const value = bigNumberify(a.value || 0)
				.div(bigNumberify(c.depositAmount || 1))
				.mul(bigNumberify(c.balanceNum || 1))

			data[a.time] = data[a.time] || { time: a.time }
			data[a.time].value = value.add(bigNumberify(data[a.time].value || 0))

			return data
		}, {})
	)
}

export function updateAccountAnalytics() {
	return async function(dispatch, getState) {
		const { account, analytics } = getState().persist
		const { side } = getState().memory.nav
		const { timeframe } = analytics
		// TODO: get channels that are needed
		const byId = selectChannelsWithUserBalancesAll()
		try {
			const toastId = addToast({
				type: 'warning',
				label: translate('SIGN_VALIDATORS_AUTH'),
				timeout: false,
				unclosable: true,
				top: true,
			})(dispatch)

			const leaderAuth = await getValidatorAuthToken({
				validatorId: VALIDATOR_LEADER_ID,
				account,
			})

			removeToast(toastId)(dispatch)

			updateValidatorAuthTokens({
				newAuth: { [VALIDATOR_LEADER_ID]: leaderAuth },
			})(dispatch, getState)

			const params = analyticsParams(timeframe, side)
			let accountChanged = false
			const allAnalytics = params.map(async opts => {
				identityAnalytics({
					...opts,
					leaderAuth,
				})
					.then(({ aggregates, metric }) => {
						const aggrByChannelSegments =
							side === 'publisher' && metric === 'eventPayouts'
						let aggr = aggrByChannelSegments
							? aggrByChannelsSegments(aggregates.aggr, byId)
							: aggregates.aggr

						aggregates.aggr = fillEmptyTime(aggr, timeframe)
						accountChanged =
							accountChanged || checkAccountChanged(getState, account)

						if (!accountChanged) {
							dispatch({
								type: types.UPDATE_ANALYTICS,
								...opts,
								value: { ...aggregates },
							})
						}
					})
					.catch(err => {
						console.error('ERR_ANALYTICS_SINGLE', err)
					})
			})

			await Promise.all(allAnalytics)
		} catch (err) {
			console.error('ERR_ANALYTICS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_ANALYTICS', { args: [getErrorMsg(err)] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function updateAccountCampaignsAnalytics() {
	return async function(dispatch, getState) {
		const { account } = getState().persist
		try {
			const toastId = addToast({
				type: 'warning',
				label: translate('SIGN_VALIDATORS_AUTH'),
				timeout: false,
				unclosable: true,
				top: true,
			})(dispatch)

			const leaderAuth = await getValidatorAuthToken({
				validatorId: VALIDATOR_LEADER_ID,
				account,
			})

			removeToast(toastId)(dispatch)

			updateValidatorAuthTokens({
				newAuth: { [VALIDATOR_LEADER_ID]: leaderAuth },
			})(dispatch, getState)

			const params = analyticsCampaignsParams()
			let accountChanged = false
			const allAnalytics = params.map(async opts => {
				identityCampaignsAnalytics({
					...opts,
					leaderAuth,
				})
					.then(res => {
						accountChanged =
							accountChanged || checkAccountChanged(getState, account)

						if (!accountChanged) {
							dispatch({
								type: types.UPDATE_ADVANCED_CAMPAIGN_ANALYTICS,
								...opts,
								value: { ...res },
							})
						}
					})
					.catch(err => {
						console.error('ERR_CAMPAIGN_ANALYTICS_SINGLE', err)
					})
			})

			await Promise.all(allAnalytics)
		} catch (err) {
			console.error('ERR_CAMPAIGN_ANALYTICS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_CAMPAIGN_ANALYTICS', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function updateAnalyticsTimeframe(timeframe) {
	return async function(dispatch, getState) {
		try {
			dispatch({
				type: types.UPDATE_ANALYTICS_TIMEFRAME,
				value: timeframe,
			})
			updateAccountAnalytics()(dispatch, getState)
		} catch (err) {
			console.error('ERR_ANALYTICS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_ANALYTICS', { args: [getErrorMsg(err)] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function resetAnalytics() {
	return async function(dispatch, getState) {
		return dispatch({
			type: types.RESET_ANALYTICS,
		})
	}
}

export const updateSlotsDemand = throttle(
	async function(dispatch) {
		await updateSpinner(UPDATING_SLOTS_DEMAND, true)(dispatch)
		try {
			const demandAnalytics = await getUnitsStatsByType()

			dispatch({
				type: types.UPDATE_DEMAND_ANALYTICS,
				value: demandAnalytics,
			})
		} catch (err) {
			console.error('ERR_SLOTS_DEMAND_ANALYTICS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_SLOTS_DEMAND_ANALYTICS', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		await updateSpinner(UPDATING_SLOTS_DEMAND, false)(dispatch)
	},
	5 * 60 * 1000,
	{ leading: true, trailing: false }
)

export const updateSlotsDemandThrottled = () => dispatch => {
	return updateSlotsDemand(dispatch)
}

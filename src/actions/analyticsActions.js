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
import {
	selectChannelsWithUserBalancesAll,
	selectFeeTokenWhitelist,
	selectRoutineWithdrawTokens,
} from 'selectors'
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

function aggrByChannelsSegments({
	aggr,
	allChannels,
	feeTokens,
	withdrawTokens,
}) {
	return Object.values(
		// NOTE: No need to sort them again because fillEmptyTime
		// is sorting by time after adding the empty time values
		// TODO: Do not check `minPlatform` for Expired channels
		aggr
			.sort((a, b) => b.time - a.time)
			.reduce(
				(data, a) => {
					const { time } = a
					const { aggregations, channels } = data
					const channelId = a.channelId.toLowerCase()

					const { depositAmount, balanceNum, depositAsset } =
						allChannels[channelId] || {}

					const { minPlatform } = withdrawTokens[depositAsset]
					const { min } = feeTokens[depositAsset]

					const current = channels[channelId] || { aggr: [] }

					const value = bigNumberify(a.value || 0)
						.mul(bigNumberify(balanceNum || 1))
						.div(bigNumberify(depositAmount || 1))

					current.aggr.push({ value, time })

					const currentAggr = aggregations[time] || {
						time,
						value: bigNumberify(0),
					}
					const currentChannelValue = bigNumberify(current.value || 0).add(
						value
					)
					const currentTimeValue = currentAggr.value

					current.value = currentChannelValue

					if (
						currentChannelValue.gt(bigNumberify(minPlatform)) &&
						!current.feeSubtracted
					) {
						current.feeSubtracted = true
						const currentAvailable = currentChannelValue.sub(bigNumberify(min))
						const currentAdded = bigNumberify(0)
						const points = current.aggr

						for (let index = points.length - 1; index >= 0; index--) {
							const point = points[index]
							currentAdded.add(point.value)

							const curInnerAggr = aggregations[point.time] || {
								time,
								value: bigNumberify(0),
							}

							if (currentAdded.lt(currentAvailable)) {
								curInnerAggr.value = curInnerAggr.value.add(point.value)
								aggregations[point.time] = curInnerAggr
							} else
								curInnerAggr.value = curInnerAggr.value.add(
									currentAdded.sub(currentAvailable)
								)
							aggregations[point.time] = curInnerAggr
							break
						}
					} else if (
						currentChannelValue.gt(bigNumberify(minPlatform)) &&
						current.feeSubtracted
					) {
						currentAggr.value = value.add(currentTimeValue)
					}

					channels[channelId] = current
					aggregations[time] = currentAggr

					return { aggregations, channels }
				},
				{ aggregations: {}, channels: {} }
			).aggregations
	)
}

export function updateAccountAnalytics() {
	return async function(dispatch, getState) {
		const { account, analytics } = getState().persist
		const { side } = getState().memory.nav
		const { timeframe } = analytics
		const allChannels = selectChannelsWithUserBalancesAll()
		const feeTokens = selectFeeTokenWhitelist()
		const withdrawTokens = selectRoutineWithdrawTokens()
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
							? aggrByChannelsSegments({
									aggr: aggregates.aggr,
									allChannels,
									feeTokens,
									withdrawTokens,
							  })
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

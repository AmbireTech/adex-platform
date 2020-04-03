import * as types from 'constants/actionTypes'
import throttle from 'lodash.throttle'
import { addToast, removeToast, updateSpinner, isAccountChanged } from 'actions'
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
	selectSide,
	selectAccount,
	selectAnalyticsTimeframe,
	selectAnalyticsPeriod,
} from 'selectors'
import { bigNumberify } from 'ethers/utils'
import utils, { makeJSDateObject } from 'helpers/dateUtils'

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

function aggrByChannelsSegments({
	aggr,
	allChannels,
	feeTokens,
	withdrawTokens,
}) {
	if (!Object.keys(allChannels).length) {
		return []
	}
	// NOTE: No need to sort them again because fillEmptyTime
	// is sorting by time after adding the empty time values
	const { aggregations, all } = aggr
		.sort((a, b) => b.time - a.time)
		.reduce(
			(data, a) => {
				const { time } = a
				const { aggregations, channels, all } = data
				const channelId = a.channelId.toLowerCase()

				const { depositAmount, balanceNum, depositAsset, status } =
					allChannels[channelId] || {}

				const { minPlatform, minFinal } = withdrawTokens[depositAsset]
				const { min } = feeTokens[depositAsset]
				const isExpired = status === 'Expired'
				const minBalance = isExpired ? minFinal : minPlatform

				const current = channels[channelId] || { aggr: [] }

				const value = bigNumberify(a.value || 0)
					.mul(bigNumberify(balanceNum || 1))
					.div(bigNumberify(depositAmount || 1))

				current.aggr.push({ value, time })

				const currentAggr = aggregations[time] || {
					time,
					value: bigNumberify(0),
				}
				const currentChannelValue = bigNumberify(current.value || 0).add(value)

				const hasMinBalance = currentChannelValue.gt(bigNumberify(minBalance))
				const currentTimeValue = currentAggr.value

				current.value = currentChannelValue

				if (hasMinBalance && !current.feeSubtracted) {
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
				} else if (hasMinBalance && current.feeSubtracted) {
					currentAggr.value = value.add(currentTimeValue)
				}

				channels[channelId] = current
				aggregations[time] = currentAggr
				all[time] = a.value || all[time]

				return { aggregations, channels, all }
			},
			{ aggregations: {}, channels: {}, all: {} }
		)

	// NOTE: force to null values when value under limits but not naturally 0
	const aggrWithNullValues = Object.values(aggregations).map(
		({ time, value }) => {
			const isNull =
				all[time] === undefined ||
				(bigNumberify(value).isZero() && all[time] !== '0')
			return { time, value: isNull ? null : value }
		}
	)

	return aggrWithNullValues
}

export function updateAccountAnalytics() {
	return async function(dispatch, getState) {
		const state = getState()
		const account = selectAccount(state)

		const side = selectSide(state)
		const timeframe = selectAnalyticsTimeframe(state)
		const allChannels = selectChannelsWithUserBalancesAll(state)
		const { start, end } = selectAnalyticsPeriod(state)
		const feeTokens = selectFeeTokenWhitelist(state)
		const withdrawTokens = selectRoutineWithdrawTokens(state)
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
					start,
					end,
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
						const defaultValue = aggrByChannelSegments ? null : 0

						aggregates.aggr = fillEmptyTime(aggr, timeframe, defaultValue, {
							start,
							end,
						})
						accountChanged =
							accountChanged || isAccountChanged(getState, account)

						if (!accountChanged) {
							dispatch({
								type: types.UPDATE_ANALYTICS,
								...opts,
								value: { ...aggregates }, // ADD TIME as well
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
				try {
					const value = await identityCampaignsAnalytics({
						...opts,
						leaderAuth,
					})

					accountChanged = accountChanged || isAccountChanged(getState, account)

					return { opts, value }
				} catch (err) {
					console.error('ERR_CAMPAIGN_ANALYTICS_SINGLE', err)
					return null
				}
			})

			const data = await Promise.all(allAnalytics)

			if (!accountChanged) {
				data
					.filter(x => !!x)
					.forEach(({ opts, value }) =>
						dispatch({
							type: types.UPDATE_ADVANCED_ANALYTICS,
							...opts,
							value,
						})
					)
			}
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
			const dateNow =
				timeframe === 'week' ? utils.addDays(utils.date(), -6) : Date.now()
			updateAnalyticsPeriod(dateNow)(dispatch, getState)
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

export function updateAnalyticsPeriod(start) {
	return async function(dispatch, getState) {
		try {
			const timeframe = selectAnalyticsTimeframe(getState())
			let end = null
			switch (timeframe) {
				case 'hour':
					start = +utils.date(start).startOf('hour')
					end = +utils.date(start).endOf('hour')
					break
				case 'day':
					start = +utils.date(start).startOf('day')
					end = +utils.date(start).endOf('day')
					break
				case 'week':
					start = +utils
						.date(start)
						.startOf('day')
						.add(utils.getLastSixHoursPeriod() * 6 + 2, 'hours')
						.valueOf()
					end = +utils
						.date(start)
						.startOf('day')
						.add(utils.getLastSixHoursPeriod() * 6, 'hours')
						.add(6, 'days')
						.valueOf()
					break
				default:
					break
			}
			start = +start
			dispatch({
				type: types.UPDATE_ANALYTICS_PERIOD,
				value: { start, end },
			})
			updateAccountAnalytics()(dispatch, getState)
		} catch (err) {
			console.error('ERR_ANALYTICS_START_DATE_END_DATE', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_ANALYTICS_START_DATE_END_DATE', {
					args: [getErrorMsg(err)],
				}),
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

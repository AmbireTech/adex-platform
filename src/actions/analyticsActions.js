import * as types from 'constants/actionTypes'
import throttle from 'lodash.throttle'
import { addToast, removeToast, updateSpinner, isAccountChanged } from 'actions'
import { translate } from 'services/translations/translations'
import {
	getValidatorAuthToken,
	identityAnalytics,
	identityCampaignsAnalytics,
	timeBasedAnalytics,
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
	selectStatsChartData,
	selectAnalyticsLiveTimestamp,
	selectPublisherReceiptsPresentMonths,
	selectMonthsRange,
	selectAnalyticsNowLabel,
	selectChartDatapointsImpressions,
} from 'selectors'
import { bigNumberify } from 'ethers/utils'
import dateUtils from 'helpers/dateUtils'
import moment from 'moment'
import { FETCHING_PUBLISHER_RECEIPTS } from 'constants/spinners'

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

export const updateAccountAnalyticsThrottled = () => (dispatch, getState) => {
	return updateAccountAnalytics(dispatch, getState)
}

export const updateAccountAnalytics = throttle(
	async function(dispatch, getState) {
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
				const { datasets, labels } = selectStatsChartData(state, {
					...opts,
				})
				const liveTimestamp = selectAnalyticsLiveTimestamp(state)
				//TODO: must check
				const chartImpressions = selectChartDatapointsImpressions(state, {
					side,
					timeframe,
				})
				const nowLabel = selectAnalyticsNowLabel(state)
				const nowImpressions =
					chartImpressions.datasets[chartImpressions.labels.indexOf(nowLabel)]
				if (
					(liveTimestamp === start && nowImpressions === 0) ||
					datasets.length === 0 ||
					labels.length === 0
				) {
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
									timestamp: liveTimestamp === start ? 'live' : start,
									value: { ...aggregates }, // ADD TIME as well
								})
							}
						})
						.catch(err => {
							console.error('ERR_ANALYTICS_SINGLE', err)
						})
				}
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
	},
	1000,
	{ leading: false, trailing: true }
)

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

export function getReceiptData(startDate, endDate) {
	return async function(dispatch, getState) {
		const state = getState()
		const { account } = state.persist
		try {
			await updateSpinner(FETCHING_PUBLISHER_RECEIPTS, true)(dispatch)
			const presentMonths = selectPublisherReceiptsPresentMonths(state)
			const monthsWanted = selectMonthsRange(startDate, endDate)
			const monthsNeeded = monthsWanted
				.filter(val => !presentMonths.includes(val))
				.sort()

			const leaderAuth = await getValidatorAuthToken({
				validatorId: VALIDATOR_LEADER_ID,
				account,
			})
			updateValidatorAuthTokens({
				newAuth: { [VALIDATOR_LEADER_ID]: leaderAuth },
			})(dispatch, getState)

			if (monthsNeeded.length > 0) {
				const timeframe = 'month'
				const limit = 500
				const promises = []
				const startDateNeeded = monthsNeeded[0]
				const endDateNeeded = monthsNeeded[monthsNeeded.length - 1]
				//limit of request is 500 days
				for (
					var m = moment(startDateNeeded);
					m.diff(endDateNeeded) <= 0;
					m.add(limit, 'day')
				) {
					promises.push(
						timeBasedAnalytics({
							leaderAuth,
							timeframe,
							limit,
							eventType: 'IMPRESSION',
							metric: 'eventCounts',
							start: +moment(startDateNeeded),
							end: +moment(endDateNeeded).endOf('month'),
						}),
						timeBasedAnalytics({
							leaderAuth,
							timeframe,
							limit,
							eventType: 'IMPRESSION',
							metric: 'eventPayouts',
							start: +moment(startDateNeeded),
							end: +moment(endDateNeeded).endOf('month'),
						})
					)
				}
				const resolvedPromises = await Promise.all(promises)
				let impressions = []
				let payouts = []
				for (let i = 0; i < resolvedPromises.length; i += 2) {
					impressions = [...impressions, ...resolvedPromises[i].aggr]
					payouts = [...payouts, ...resolvedPromises[i + 1].aggr]
				}
				const result = {}
				// add wanted dates
				const getMonthTimeStamp = date => +moment(date).startOf('month')
				monthsNeeded.forEach(date => {
					const month = getMonthTimeStamp(date)
					if (!result[month]) {
						result[month] = {}
					}
				})
				impressions.forEach((item, i) => {
					const month = getMonthTimeStamp(item.time)
					if (result[month]) {
						result[month][item.time] = {
							impressions: item.value,
							payouts: payouts[i].value,
						}
					}
				})
				dispatch({
					type: types.UPDATE_PUBLISHER_RECEIPTS,
					value: {
						...result,
					},
				})
			}
			await updateSpinner(FETCHING_PUBLISHER_RECEIPTS, false)(dispatch)
		} catch (err) {
			console.log(err)
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
			updateAnalyticsPeriod(Date.now())(dispatch, getState)
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
			const startCopy = start
			const startOfWeek = dateUtils.date(startCopy).startOf('week')
			const endOfWeek = dateUtils.date(startCopy).endOf('week')
			switch (timeframe) {
				case 'hour':
					start = +dateUtils.date(startCopy).startOf('hour')
					end = +dateUtils.date(startCopy).endOf('hour')
					break
				case 'day':
					start = +dateUtils.date(startCopy).startOf('day')
					end = +dateUtils.date(startCopy).endOf('day')
					break
				case 'week':
					start = +dateUtils.addHours(
						startOfWeek,
						dateUtils.getUTCOffset(startOfWeek)
					)
					end = +dateUtils.addHours(
						endOfWeek,
						dateUtils.getUTCOffset(endOfWeek)
					)
					break
				default:
					break
			}

			start = +start
			dispatch({
				type: types.UPDATE_ANALYTICS_PERIOD,
				value: { start, end },
			})
			updateAccountAnalyticsThrottled()(dispatch, getState)
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

export function updateAnalyticsPeriodPrevNextLive({
	next = false,
	live = false,
}) {
	return async function(dispatch, getState) {
		try {
			const timeframe = selectAnalyticsTimeframe(getState())
			let { start } = selectAnalyticsPeriod(getState())
			const startCopy = start
			switch (timeframe) {
				case 'hour':
					start = +dateUtils.addHours(dateUtils.date(start), next ? 1 : -1)
					break
				case 'day':
					start = +dateUtils.addDays(dateUtils.date(start), next ? 1 : -1)
					break
				case 'week':
					start = +dateUtils.addWeeks(dateUtils.date(start), next ? 1 : -1)
					break
				default:
					start = +dateUtils.addDays(dateUtils.date(start), next ? 1 : -1)
					break
			}
			if (dateUtils.isAfter(dateUtils.date(start), dateUtils.date())) {
				start = startCopy
			}
			if (live) {
				start = +dateUtils.date()
			}
			updateAnalyticsPeriod(start)(dispatch, getState)
		} catch (err) {
			console.error('ERR_ANALYTICS_PREV_PERIOD', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_ANALYTICS_PREV_PERIOD', {
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

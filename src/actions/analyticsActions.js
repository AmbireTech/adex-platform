import * as types from 'constants/actionTypes'
import throttle from 'lodash.throttle'
import { addToast, removeToast, updateSpinner, isAccountChanged } from 'actions'
import { translate } from 'services/translations/translations'
import {
	getValidatorAuthToken,
	identityAnalytics,
	identityAdvancedAnalytics,
	timeBasedAnalytics,
} from 'services/adex-validator/actions'
import { updateValidatorAuthTokens } from './accountActions'
import {
	VALIDATOR_ANALYTICS_EVENT_TYPES,
	VALIDATOR_ANALYTICS_METRICS,
} from 'constants/misc'
import {
	UPDATING_SLOTS_DEMAND,
	UPDATING_TARGETING_DATA,
} from 'constants/spinners'
import { getErrorMsg } from 'helpers/errors'
import { fillEmptyTime } from 'helpers/analyticsTimeHelpers'
import { getUnitsStatsByType } from 'services/adex-market/aggregates'
import { getTargetingData } from 'services/adex-market/actions'
import {
	selectChannelsWithUserBalancesAll,
	selectFeeTokenWhitelist,
	selectRoutineWithdrawTokens,
	selectAnalyticsDataSide,
	selectAccount,
	selectStatsChartData,
	selectAnalyticsLiveTimestamp,
	selectPublisherReceiptsPresentMonths,
	selectIdentitySideAnalyticsTimeframe,
	selectIdentitySideAnalyticsPeriod,
	selectMonthsRange,
} from 'selectors'
import { BigNumber } from 'ethers'
import moment from 'moment'
import { FETCHING_PUBLISHER_RECEIPTS } from 'constants/spinners'
import { DEFAULT_WEEK_HOURS_SPAN } from 'helpers/analyticsTimeHelpers'

const VALIDATOR_LEADER_ID = process.env.VALIDATOR_LEADER_ID

const analyticsParams = ({ timeframe, side }) => {
	const callsParams = []

	VALIDATOR_ANALYTICS_EVENT_TYPES.forEach(eventType =>
		VALIDATOR_ANALYTICS_METRICS.forEach(metric => {
			const segmentByChannel =
				side === 'for-publisher' && metric === 'eventPayouts' ? true : undefined
			const limit = segmentByChannel ? 100 * 25 : 100
			callsParams.push({
				metric,
				timeframe,
				side,
				eventType,
				weekHoursSpan: DEFAULT_WEEK_HOURS_SPAN,
				segmentByChannel,
				limit,
			})
		})
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

function aggrByChannelsSegments({ aggr, allChannels, withdrawTokens }) {
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
				const {
					depositAmount,
					balanceNum,
					//  depositAsset,
					//  status,
					// 	balance
				} = allChannels[channelId] || {}

				// NOTE: check if the channel has lifetime min balance e.g. it is in the total balance
				// - need to be synced with relayer way for auto sweep - only when campaign is complete

				// const { minPlatform, minFinal } = withdrawTokens[depositAsset]
				// const isExpired = status === 'Expired'
				// const minBalance = isExpired ? minFinal : minPlatform
				// const hasMinBalance = BigNumber.from(balance).gt(BigNumber.from(minBalance))

				// if (hasMinBalance) {
				const current = channels[channelId] || { aggr: [] }

				const value = BigNumber.from(a.value || 0)
					.mul(BigNumber.from(balanceNum || 1))
					.div(BigNumber.from(depositAmount || 1))

				current.aggr.push({ value, time })

				const currentAggr = aggregations[time] || {
					time,
					value: BigNumber.from(0),
				}
				const currentChannelValue = BigNumber.from(current.value || 0).add(
					value
				)

				const currentTimeValue = currentAggr.value

				current.value = currentChannelValue

				currentAggr.value = value.add(currentTimeValue)

				channels[channelId] = current
				aggregations[time] = currentAggr
				all[time] = a.value || all[time]
				// }

				return { aggregations, channels, all }
			},
			{ aggregations: {}, channels: {}, all: {} }
		)

	// NOTE: force to null values when value under limits but not naturally 0
	const aggrWithNullValues = Object.values(aggregations).map(
		({ time, value }) => {
			const isNull =
				all[time] === undefined ||
				(BigNumber.from(value).isZero() && all[time] !== '0')
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
		updateAnalyticsLastChecked()(dispatch)
		const state = getState()
		const { start, end, callEnd } = selectIdentitySideAnalyticsPeriod(state)

		if (!start || !end || !callEnd) {
			console.warn('updateAccountAnalytics - periods no selected')
			return
		}

		const account = selectAccount(state)
		const side = selectAnalyticsDataSide(state)
		const timeframe = selectIdentitySideAnalyticsTimeframe(state)
		const allChannels = selectChannelsWithUserBalancesAll(state)
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

			const params = analyticsParams({ timeframe, side })
			let accountChanged = false
			const liveTimestamp = selectAnalyticsLiveTimestamp(state)
			const timeframeIsLive = liveTimestamp === start
			const allAnalytics = params.map(async opts => {
				const { datasets, labels } = selectStatsChartData(state, {
					...opts,
				})

				if (timeframeIsLive || datasets.length === 0 || labels.length === 0) {
					identityAnalytics({
						...opts,
						start,
						end: callEnd || end,
						leaderAuth,
					})
						.then(({ aggregates, metric }) => {
							const aggrByChannelSegments =
								side === 'for-publisher' && metric === 'eventPayouts'

							let aggr = aggrByChannelSegments
								? aggrByChannelsSegments({
										aggr: aggregates.aggr,
										allChannels,
										feeTokens,
										withdrawTokens,
								  })
								: aggregates.aggr
							const fillAfterLast = aggrByChannelSegments ? null : 0

							aggregates.aggr = fillEmptyTime(
								aggr,
								timeframe,
								0,
								fillAfterLast,
								{
									start,
									end,
								}
							)
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

export function updateAccountAdvancedAnalytics() {
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
					const value = await identityAdvancedAnalytics({
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
							side: 'for-publisher',
							eventType: 'IMPRESSION',
							metric: 'eventCounts',
							start: +moment(startDateNeeded),
							end: +moment(endDateNeeded).endOf('month'),
						}),
						timeBasedAnalytics({
							leaderAuth,
							timeframe,
							limit,
							side: 'for-publisher',
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

export function resetAnalytics() {
	return async function(dispatch, getState) {
		return dispatch({
			type: types.RESET_ANALYTICS,
		})
	}
}

export function updateAnalyticsLastChecked() {
	return async function(dispatch) {
		return dispatch({
			type: types.UPDATE_ANALYTICS_LAST_CHECKED,
			value: new Date(),
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

export const updateTargetingData = throttle(
	async function(dispatch) {
		await updateSpinner(UPDATING_TARGETING_DATA, true)(dispatch)
		try {
			const {
				targetingData,
				minByCategory,
				countryTiersCoefficients,
			} = await getTargetingData()

			dispatch({
				type: types.UPDATE_TARGETING_ANALYTICS,
				value: { targetingData, minByCategory, countryTiersCoefficients },
			})
		} catch (err) {
			console.error('ERR_TARGETING_DATA_ANALYTICS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_TARGETING_DATA_ANALYTICS', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		await updateSpinner(UPDATING_TARGETING_DATA, false)(dispatch)
	},
	5 * 60 * 1000,
	{ leading: true, trailing: false }
)

export const updateSlotsDemandThrottled = () => dispatch => {
	return updateSlotsDemand(dispatch)
}

export const updateTargetingDataThrottled = () => dispatch => {
	return updateTargetingData(dispatch)
}

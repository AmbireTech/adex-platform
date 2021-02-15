import { getState } from 'store'
import { createSelector } from 'reselect'
import { createCachedSelector } from 're-reselect'
import {
	selectChannelsWithUserBalancesAll,
	selectIdentitySideAnalyticsTimeframe,
	selectAccountIdentityCreatedDate,
	selectNewItemByTypeAndId,
	selectIdentitySideAnalyticsPeriod,
	selectCampaignInDetails,
} from 'selectors'
import { selectAdUnits } from './itemsSelectors'

import { formatTokenAmount } from 'helpers/formatters'
import {
	getPeriodDataPointLabel,
	getMinStartDateTimeByTimeframe,
} from 'helpers/analyticsTimeHelpers'

import dateUtils from 'helpers/dateUtils'
import { DEFAULT_DATETIME_FORMAT } from 'helpers/formatters'
import { t } from './translationsSelectors'
import { selectAdSlotsArray } from './itemsSelectors'
import { selectInitialDataLoadedByData } from './uiSelectors'

export const selectAnalytics = state => state.memory.analytics
export const selectTargeting = state => state.persist.targeting

const MIN_SLOTS_FOR_AD_TYPE = 2

export const selectAdvancedAnalytics = createSelector(
	[selectAnalytics],
	analytics => analytics.advanced || {}
)

export const selectAnalyticsLastChecked = createSelector(
	selectAnalytics,
	({ lastChecked }) => {
		return lastChecked || new Date()
	}
)

export const selectAnalyticsLiveTimestamp = createSelector(
	[
		selectIdentitySideAnalyticsTimeframe,
		selectAnalyticsLastChecked,
		selectCampaignInDetails,
	],
	(timeframe, lastChecked, campaign) => {
		const currentDate = campaign
			? dateUtils.date(
					Math.min(campaign.withdrawPeriodStart, +dateUtils.date())
			  )
			: dateUtils.date(lastChecked)
		let start = dateUtils.date(currentDate)
		switch (timeframe) {
			case 'hour':
				const hourStart = dateUtils.addMinutes(currentDate, -59)
				start = dateUtils.startOfMinute(hourStart)
				break
			case 'day':
				const dayStart = dateUtils.addHours(currentDate, -23)
				start = dateUtils.startOfHour(dayStart)
				break
			case 'week':
				const weekStart = dateUtils.addDays(currentDate, -6)
				start = dateUtils.getHourSpanStart(weekStart, 3)
				break
			case 'month':
				const monthStart = dateUtils.addDays(
					dateUtils.addMonths(currentDate, -1),
					1
				)
				start = dateUtils.startOfDay(monthStart)
				break
			case 'year':
				const yearStart = dateUtils.addMonths(currentDate, -11)
				start = dateUtils.startOfMonth(yearStart)
				break
			default:
				start = dateUtils.startOfHour(start)
				break
		}

		return +start
	}
)

export const selectCampaignAnalytics = createSelector(
	[selectAnalytics],
	({ campaigns }) => campaigns || {}
)

export const selectDemandAnalytics = createSelector(
	[selectAnalytics],
	({ demand }) => demand || {}
)

export const selectDemandAnalyticsByType = createCachedSelector(
	selectDemandAnalytics,
	(_, type) => type,
	(demand, type) => demand[type] || {}
)((_state, type = '-') => type)

export const selectTargetingAnalytics = createSelector(
	[selectTargeting],
	({ targetingData = [] }) => targetingData
)

export const selectTargetingAnalyticsMinByCategories = createSelector(
	[selectTargeting],
	({ minByCategory = {} }) => minByCategory
)

export const selectTargetingAnalyticsCountryTiersCoefficients = createSelector(
	[selectTargeting],
	({ countryTiersCoefficients = {} }) => countryTiersCoefficients
)

export const selectVerifiedActiveTargetingAnalytics = createSelector(
	[selectTargetingAnalytics],
	targetingAnalytics => {
		const bySlotCount = targetingAnalytics.reduce((byType, x) => {
			x.types.forEach(t => {
				byType[t] = (byType[t] || 0) + 1
			})

			return byType
		}, {})

		return targetingAnalytics
			.filter(
				x =>
					!!x.categories &&
					x.categories.length &&
					x.types &&
					x.types.length &&
					!!x.campaignsEarnedFrom
			)
			.map(t => ({
				...t,
				types: t.types.filter(x => bySlotCount[x] >= MIN_SLOTS_FOR_AD_TYPE),
			}))
			.filter(x => x.types.length)
	}
)

export const selectTargetingAnalyticsCurrentlyUsedTypes = createSelector(
	[selectNewItemByTypeAndId],
	item => {
		return item && item.adUnits ? item.adUnits.map(u => u.type) : null
	}
)

export const selectTargetingAnalyticsByType = createSelector(
	[
		selectVerifiedActiveTargetingAnalytics,
		selectTargetingAnalyticsCurrentlyUsedTypes,
	],
	(targetingAnalytics, types) => {
		const filterByType = types && types.length

		return targetingAnalytics.filter(
			x =>
				!filterByType || (filterByType && types.some(t => x.types.includes(t)))
		)
	}
)

export const selectTargetingCategoriesByType = createSelector(
	[selectTargetingAnalyticsByType],
	targeting =>
		Array.from(
			targeting.reduce((categories, x) => {
				x.categories.forEach(c => categories.add(c))
				return categories
			}, new Set())
		)
)

export const selectTargetingPublishersByType = createSelector(
	[selectTargetingAnalyticsByType],
	targeting => {
		return Array.from(
			targeting
				.reduce((publishers, { owner, hostname, alexaRank, categories }) => {
					publishers.set(hostname, { owner, hostname, alexaRank, categories })
					return publishers
				}, new Map())
				.values()
		).sort((a, b) => {
			if (a.alexaRank && !b.alexaRank) {
				return -1
			} else if (a.alexaRank && b.alexaRank) {
				return a.alexaRank - b.alexaRank
			} else if (!a.alexaRank && b.alexaRank) {
				return 1
			} else {
				return 1
			}
		})
	}
)

export const selectTargetingCategories = createSelector(
	[selectTargetingAnalytics],
	targeting =>
		Array.from(
			targeting.reduce((categories, x) => {
				x.categories.forEach(c => categories.add(c))
				return categories
			}, new Set())
		)
)

// It is used for exclusion so they are not filtered and are sorted from worst to best
export const selectAllTargetingPublishers = createSelector(
	[selectTargetingAnalytics],
	targeting => {
		return Array.from(
			targeting
				.reduce((publishers, { owner, hostname, alexaRank, categories }) => {
					publishers.set(hostname, { owner, hostname, alexaRank, categories })
					return publishers
				}, new Map())
				.values()
		).sort((a, b) => {
			if (a.alexaRank && !b.alexaRank) {
				return 1
			} else if (a.alexaRank && b.alexaRank) {
				return a.alexaRank - b.alexaRank
			} else if (!a.alexaRank && b.alexaRank) {
				return -1
			} else {
				return -1
			}
		})
	}
)

export const selectAdvancedAnalyticsByType = createCachedSelector(
	selectAdvancedAnalytics,
	(_, type) => type,
	(campaignAnalytics, type) => campaignAnalytics[type] || {}
)((_state, type = '-') => type)

const mapTotalChanelToAdUnitData = (adUnits, advancedAnalytics) => {
	const totalByAdUnit = Object.values(
		advancedAnalytics.byChannelStats || {}
	).reduce((byUnit, curr) => {
		Object.entries(curr.reportChannelToAdUnit || {}).forEach(([key, value]) => {
			if (adUnits[key]) {
				byUnit[key] = (byUnit[key] || 0) + value
			}
		})

		return byUnit
	}, {})

	return totalByAdUnit
}

export const selectAdUnitsTotalStats = createSelector(
	[selectAdUnits, selectAdvancedAnalytics],
	(adUnits, advancedAnalytics) => {
		const stats = {
			IMPRESSION: mapTotalChanelToAdUnitData(
				adUnits,
				advancedAnalytics.IMPRESSION || {}
			),
			CLICK: mapTotalChanelToAdUnitData(adUnits, advancedAnalytics.CLICK || {}),
		}

		return stats
	}
)

export const selectPublisherStatsByType = createCachedSelector(
	selectAdvancedAnalyticsByType,
	({ publisherStats }) => publisherStats || {}
)((_state, type = '-') => type)

export const selectPublisherStatsByCountry = (state, type) =>
	selectPublisherStatsByType(state, type).reportPublisherToCountry || {}

export const selectPublisherPayStatsByCountry = (state, type) =>
	selectPublisherStatsByType(state, type).reportPublisherToCountryPay || {}

export const selectPublisherStatsAdUnit = (state, type) =>
	selectPublisherStatsByType(state, type).reportPublisherToAdUnit || {}

export const selectPublisherStatsAdUnitPay = (state, type) =>
	selectPublisherStatsByType(state, type).reportPublisherToAdUnitPay || {}

export const selectPublisherStatsAdSlot = (state, type) =>
	selectPublisherStatsByType(state, type).reportPublisherToAdSlot || {}

export const selectPublisherStatsAdSlotPay = (state, type) =>
	selectPublisherStatsByType(state, type).reportPublisherToAdSlotPay || {}

export const selectPublisherAggrStatsByCountry = createCachedSelector(
	selectPublisherStatsByCountry,
	(byCountry = {}) => ({
		max: Math.max.apply(null, Object.values(byCountry)),
		total: Object.values(byCountry).reduce(
			(a, value) => a + (Number(value) || 0),
			0
		),
	})
)((_state, type = '-') => type)

export const selectAllAdUnitsInChannels = createSelector(
	[selectChannelsWithUserBalancesAll],
	withBalanceAll =>
		Object.values(withBalanceAll).reduce((units, { adUnits = [] } = {}) => {
			adUnits.forEach(u => {
				const id = u.id || u.ipfs
				if (id && !units[id]) {
					units[id] = { ...u, id }
				}
			})
			return units
		}, {})
)

export const selectPublisherAdvanceStatsToAdUnit = createSelector(
	state => [
		selectAllAdUnitsInChannels(state),
		selectPublisherStatsAdUnit(state, 'IMPRESSION'),
		selectPublisherStatsAdUnit(state, 'CLICK'),
		selectPublisherStatsAdUnitPay(state, 'IMPRESSION'),
		selectPublisherStatsAdUnitPay(state, 'CLICK'),
	],
	([
		adUnits,
		impressionsByAdUnit,
		clicksByAdUnit,
		impressionsPayByAdUnit,
		clicksPayByAdUnit,
	]) =>
		Object.values(adUnits)
			.filter(i => impressionsByAdUnit[i.id] !== undefined)
			.map(item => ({
				...item,
				impressions: impressionsByAdUnit[item.id],
				clicks: clicksByAdUnit[item.id],
				impressionsPay: Number(impressionsPayByAdUnit[item.id] || 0),
				clicksPay: Number(clicksPayByAdUnit[item.id] || 0),
			}))
)

export const selectPublisherAdvanceStatsToAdSlot = createSelector(
	state => [
		selectPublisherStatsAdSlot(state, 'IMPRESSION'),
		selectPublisherStatsAdSlot(state, 'CLICK'),
		selectPublisherStatsAdSlotPay(state, 'IMPRESSION'),
		selectPublisherStatsAdSlotPay(state, 'CLICK'),
	],
	([
		impressionsByAdSlot,
		clicksByAdSlot,
		impressionsPayByAdSlot,
		clicksPayByAdSlot,
	]) => ({
		impressionsByAdSlot,
		clicksByAdSlot,
		impressionsPayByAdSlot,
		clicksPayByAdSlot,
	})
)

export const selectPublisherTotalImpressions = createCachedSelector(
	state => selectPublisherStatsByType(state, 'IMPRESSION'),
	({ reportPublisherToAdUnit }) => {
		const totalImpressions = reportPublisherToAdUnit
			? Object.values(reportPublisherToAdUnit).reduce(
					(a, value) => a + Number(value) || 0,
					0
			  )
			: 0

		return totalImpressions
	}
)(_state => 'IMPRESSION')

export const selectCampaignAnalyticsByChannelStats = (
	state,
	type,
	campaignId
) => {
	const { byChannelStats = {} } = selectAdvancedAnalyticsByType(state, type)

	return byChannelStats[campaignId] || {}
}

export const selectCampaignAnalyticsByChannelToCountry = createCachedSelector(
	selectCampaignAnalyticsByChannelStats,
	({ reportChannelToCountry }) => reportChannelToCountry || {}
)((_state, type, campaignId) => `${type}:${campaignId}`)

export const selectCampaignAnalyticsByChannelToCountryPay = createCachedSelector(
	selectCampaignAnalyticsByChannelStats,
	({ reportChannelToCountryPay }) => reportChannelToCountryPay || {}
)((_state, type = '-', campaignId = '-') => `${type}:${campaignId}`)

export const selectCampaignAggrStatsByCountry = createCachedSelector(
	selectCampaignAnalyticsByChannelToCountry,
	(byCountry = {}) => ({
		max: Math.max.apply(null, Object.values(byCountry)),
		total: Object.values(byCountry).reduce(
			(a, value) => a + (Number(value) || 0),
			0
		),
	})
)((_state, type = '-', campaignId = '-') => `${type}:${campaignId}`)

export const selectCampaignAnalyticsByChannelToAdUnit = createCachedSelector(
	selectCampaignAnalyticsByChannelStats,

	({ reportChannelToAdUnit }) => reportChannelToAdUnit || {}
)((_state, type, campaignId) => `${type}:${campaignId}`)

export const selectMaxAdUnitStatByChannel = createCachedSelector(
	selectCampaignAnalyticsByChannelStats,
	({ reportChannelToAdUnit }) =>
		reportChannelToAdUnit
			? Math.max.apply(null, [0, ...Object.values(reportChannelToAdUnit)])
			: 0
)((_state, type = '-', campaignId = '-') => `${type}:${campaignId}`)

export const selectAnalyticsDataAggr = createCachedSelector(
	selectAnalytics,
	selectIdentitySideAnalyticsPeriod,
	selectAnalyticsLiveTimestamp,
	(_, opts = {}) => opts,
	(
		analytics = {},
		{ start },
		liveTimestamp,
		{ side, eventType, metric, timeframe }
	) => {
		// return analytics[side]['eventType'][metric][timeframe].aggr
		// NOTE: It was working fine with default initial state but
		// when eventType CLICK was added if you were logged and had
		// old analytics the initialState is not applied === boom.

		const {
			[side]: {
				[eventType]: {
					[metric]: {
						[timeframe]: {
							[liveTimestamp === start ? 'live' : start]: { aggr } = {},
						} = {},
					} = {},
				} = {},
			} = {},
		} = analytics

		return aggr
	}
)(
	(_state, { side = '-', eventType = '-', metric = '-', timeframe = '-' }) =>
		`${side}:${eventType}:${metric}:${timeframe}`
)

export function selectCampaignEventsCount(type, campaignId) {
	return Object.values(
		// TODO: fix this selector w/o using getState
		selectCampaignAnalyticsByChannelToAdUnit(getState(), type, campaignId)
	).reduce((a, b) => a + b, 0)
}

const mapEventCounts = (data = {}) => {
	return Object.values(data).reduce((a, b) => a + b, 0)
}

const getChannelToAdUnitData = (advancedAnalytics, campaignId, eventType) => {
	const { byChannelStats = {} } = advancedAnalytics[eventType] || {}
	const { reportChannelToAdUnit = {} } = byChannelStats[campaignId] || {}
	return reportChannelToAdUnit
}

export const selectCampaignsEventCountsStats = createSelector(
	selectAdvancedAnalytics,
	advancedAnalytics => {
		const { byChannelStats = {} } = advancedAnalytics.IMPRESSION || {}
		return Object.keys(byChannelStats).reduce((stats, key) => {
			stats[key] = {
				impressions: mapEventCounts(
					getChannelToAdUnitData(advancedAnalytics, key, 'IMPRESSION')
				),
				clicks: mapEventCounts(
					getChannelToAdUnitData(advancedAnalytics, key, 'CLICK')
				),
			}

			return stats
		}, {})
	}
)

export const selectCampaignsEventCountsStatsById = createCachedSelector(
	selectCampaignsEventCountsStats,
	(_state, id) => id,
	(eventCounts, id) => eventCounts[id] || { impressions: 0, clicks: 0 }
)((_state, id) => id)

export const selectTotalImpressions = createCachedSelector(
	(state, { side, timeframe } = {}) =>
		selectAnalyticsDataAggr(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventCounts',
		}),
	eventCounts =>
		eventCounts
			? eventCounts.reduce((a, { value }) => a + Number(value) || 0, 0)
			: null
)((_state, { side = '-', timeframe = '-' }) => `${side}:${timeframe}`)

export const selectTotalClicks = createCachedSelector(
	(state, { side, timeframe } = {}) =>
		selectAnalyticsDataAggr(state, {
			side,
			timeframe,
			eventType: 'CLICK',
			metric: 'eventCounts',
		}),
	eventCounts =>
		eventCounts
			? eventCounts.reduce((a, { value }) => a + Number(value) || 0, 0)
			: null
)((_state, { side = '-', timeframe = '-' }) => `${side}:${timeframe}`)

export const selectTotalMoney = createCachedSelector(
	(state, { side, timeframe } = {}) =>
		selectAnalyticsDataAggr(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventPayouts',
		}),
	eventPayouts =>
		eventPayouts
			? eventPayouts.reduce(
					(a, { value }) => a + Number(formatTokenAmount(value || 0, 18)) || 0,
					0
			  )
			: null
)((_state, { side = '-', timeframe = '-' }) => `${side}:${timeframe}`)

export const selectTotalImpressionsWithPayouts = createCachedSelector(
	(state, { side, timeframe } = {}) =>
		selectAnalyticsDataAggr(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventCounts',
		}),
	(state, { side, timeframe } = {}) =>
		selectAnalyticsDataAggr(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventPayouts',
		}),
	(eventCounts, eventPayouts) =>
		eventCounts && eventPayouts
			? eventCounts
					.filter(
						c =>
							(eventPayouts.find(e => e.time === c.time) || { value: null })
								.value !== null
					)
					.reduce((a, { time, value }) => a + Number(value) || 0, 0)
			: null
)((_state, { side = '-', timeframe = '-' }) => `${side}:${timeframe}`)

export const selectAverageCPM = createCachedSelector(
	(state, { side, timeframe } = {}) =>
		selectTotalMoney(state, { side, timeframe }),
	(state, { side, timeframe } = {}) =>
		selectTotalImpressionsWithPayouts(state, { side, timeframe }),
	(totalMoney, totalImpressions) =>
		totalMoney !== null && totalImpressions !== null
			? (1000 * Number(totalMoney)) / Number(totalImpressions)
			: null
)((_state, { side = '-', timeframe = '-' }) => `${side}:${timeframe}`)

const parseValueByMetric = ({ value, metric }) => {
	switch (metric) {
		case 'eventPayouts':
			return parseFloat(formatTokenAmount(value, 18))
		case 'eventCounts':
			return parseInt(value, 10)
		default:
			return value
	}
}

export const selectStatsChartData = createCachedSelector(
	(state, { noLastOne, ...rest } = {}) => selectAnalyticsDataAggr(state, rest),
	(_state, { noLastOne, metric, timeframe } = {}) => ({
		noLastOne,
		metric,
		timeframe,
	}),
	(data = [], { noLastOne, metric, timeframe }) => {
		const aggr = noLastOne ? data.slice(0, -1) : data
		return aggr.reduce(
			(memo, item) => {
				const { time, value } = item
				let label = getPeriodDataPointLabel({ timeframe, time })

				memo.labels.push(label)
				memo.datasets.push(
					value !== null ? parseValueByMetric({ value, metric }) : value
				)
				return memo
			},
			{
				labels: [],
				datasets: [],
			}
		)
	}
)(
	(_state, { noLastOne = '-', metric = '-', timeframe = '-' }) =>
		`${metric}:${timeframe}:${noLastOne}`
)

export const selectChartDatapointsImpressions = createCachedSelector(
	(state, { side, timeframe } = {}) =>
		selectStatsChartData(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventCounts',
			noLastOne: false,
		}),

	impressions => impressions
)((_state, { side = '-', timeframe = '-' }) => `${side}:${timeframe}`)

export const selectChartDatapointsClicks = createCachedSelector(
	(state, { side, timeframe } = {}) =>
		selectStatsChartData(state, {
			side,
			timeframe,
			eventType: 'CLICK',
			metric: 'eventCounts',
			noLastOne: false,
		}),

	clicks => clicks
)((_state, { side = '-', timeframe = '-' }) => `${side}:${timeframe}`)

export const selectChartDatapointsPayouts = createCachedSelector(
	(state, { side, timeframe } = {}) =>
		selectStatsChartData(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventPayouts',
			noLastOne: false,
		}),
	payouts => payouts
)((_state, { side = '-', timeframe = '-' }) => `${side}:${timeframe}`)

export const selectInitialDataLoaded = createSelector(
	state => [
		selectInitialDataLoadedByData(state, 'allChannels'),
		selectInitialDataLoadedByData(state, 'advancedAnalytics'),
		selectInitialDataLoadedByData(state, 'allItems'),
	],
	([allChannelsLoaded, advAnalyticsLoaded, itemsLoaded]) =>
		allChannelsLoaded && advAnalyticsLoaded && itemsLoaded
)

export const selectPublisherHasAdSlotsButNoImpressionsLastHour = createSelector(
	(state, { timeframe } = {}) => [
		selectChartDatapointsImpressions(state, {
			side: 'for-publisher',
			timeframe,
		}),
		selectAdSlotsArray(state),
	],
	([data, adSlotsArray]) => {
		const { datasets } = data
		const hasAdSlots = adSlotsArray.length > 0
		const noImpressions =
			datasets.length > 0 ? Math.max(...datasets) === 0 : false
		return hasAdSlots && noImpressions
	}
)

export const selectChartDatapointsCPM = createCachedSelector(
	(state, { side, timeframe } = {}) =>
		selectChartDatapointsPayouts(state, { side, timeframe }),
	(state, { side, timeframe } = {}) =>
		selectChartDatapointsImpressions(state, { side, timeframe }),

	(payouts, impressions) => {
		const result = {
			labels: [],
			datasets: [],
		}
		result.labels = payouts.labels
		result.datasets = payouts.datasets.map((n, i) => {
			return impressions.datasets[i] !== 0
				? ((n / impressions.datasets[i]) * 1000).toFixed(6)
				: n
		})
		return result
	}
)((_state, { side = '-', timeframe = '-' }) => `${side}:${timeframe}`)

export const selectPublisherReceipts = createSelector(
	[selectAnalytics],
	({ receipts }) => receipts || {}
)

export const selectPublisherReceiptsPresentMonths = createSelector(
	[selectPublisherReceipts],
	receipts => Object.keys(receipts).map(r => +r)
)

export const selectAnalyticsNowLabel = createSelector(
	[selectIdentitySideAnalyticsTimeframe, selectAnalyticsLastChecked],
	(timeframe, lastChecked) => {
		switch (timeframe) {
			case 'hour':
				return dateUtils.format(
					dateUtils.date(lastChecked),
					DEFAULT_DATETIME_FORMAT
				)
			case 'day':
				return dateUtils.format(
					dateUtils.setMinutes(dateUtils.date(lastChecked), 0),
					DEFAULT_DATETIME_FORMAT
				)
			case 'week':
				return dateUtils.format(
					dateUtils.getHourSpanStart(lastChecked, 3),
					DEFAULT_DATETIME_FORMAT
				)
			default:
				return dateUtils.format(dateUtils.date(), DEFAULT_DATETIME_FORMAT)
		}
	}
)

export const selectAnalyticsMinAndMaxDates = createSelector(
	[
		selectCampaignInDetails,
		selectAccountIdentityCreatedDate,
		selectIdentitySideAnalyticsTimeframe,
	],
	(campaign = {}, dateCreated, timeframe) => {
		const { activeFrom, withdrawPeriodStart, status = {} } = campaign

		const minDate = getMinStartDateTimeByTimeframe({
			timeframe,
			time: dateUtils.date(activeFrom || dateCreated),
		})
		const maxDate = getMinStartDateTimeByTimeframe({
			timeframe,
			time: status.closedDate || withdrawPeriodStart || dateUtils.date(),
		})

		return {
			minDate: +minDate,
			maxDate: +maxDate,
		}
	}
)

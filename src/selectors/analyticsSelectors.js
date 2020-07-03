import { getState } from 'store'
import { createSelector } from 'reselect'
import {
	selectChannelsWithUserBalancesAll,
	selectIdentitySideAnalyticsTimeframe,
} from 'selectors'
import { formatTokenAmount, formatDateTime } from 'helpers/formatters'
import {
	selectWebsitesArray,
	selectIdentitySideAnalyticsPeriod,
} from 'selectors'
import dateUtils from 'helpers/dateUtils'
import { DEFAULT_DATETIME_FORMAT } from 'helpers/formatters'
import { t } from './translationsSelectors'

export const selectAnalytics = state => state.memory.analytics
export const selectTargeting = state => state.persist.targeting

const MIN_SLOTS_FOR_AD_TYPE = 2

export const selectAnalyticsData = createSelector(
	[selectAnalytics, (_, side) => side],
	(analytics, side) => {
		return analytics[side] || {}
	}
)

export const selectAdvancedAnalytics = createSelector(
	[selectAnalytics],
	analytics => analytics.advanced || {}
)

export const selectAnalyticsLastChecked = createSelector(
	selectAnalytics,
	({ lastChecked }) => {
		return lastChecked || Date.now()
	}
)

export const selectAnalyticsLiveTimestamp = createSelector(
	[selectIdentitySideAnalyticsTimeframe, selectAnalyticsLastChecked],
	(timeframe, lastChecked) => {
		switch (timeframe) {
			case 'hour':
				return +dateUtils.date(lastChecked).startOf('hour')
			case 'day':
				return +dateUtils.date(lastChecked).startOf('day')
			case 'week':
				return +dateUtils
					.date(lastChecked)
					.startOf('week')
					.add(23, 'hours')
					.utc()
					.startOf('day')
			default:
				return +dateUtils.date(lastChecked).startOf('hour')
		}
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

export const selectDemandAnalyticsByType = createSelector(
	[selectDemandAnalytics, (_, type) => type],
	(demand, type) => demand[type] || {}
)

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

export const selectTargetingAnalyticsWithMinSlotsCountByType = createSelector(
	[selectTargetingAnalytics],
	targetingAnalytics => {
		const bySlotCount = targetingAnalytics.reduce((byType, x) => {
			x.types.forEach(t => {
				byType[t] = (byType[t] || 0) + 1
			})

			return byType
		}, {})

		return targetingAnalytics
			.map(t => ({
				...t,
				types: t.types.filter(x => bySlotCount[x] >= MIN_SLOTS_FOR_AD_TYPE),
			}))
			.filter(x => x.types.length && x.categories.length)
	}
)

export const selectTargetingAnalyticsByType = createSelector(
	[selectTargetingAnalyticsWithMinSlotsCountByType, (_, types) => types],
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

export const selectAdvancedAnalyticsByType = createSelector(
	[selectAdvancedAnalytics, (_, type) => type],
	(campaignAnalytics, type) => campaignAnalytics[type] || {}
)

export const selectTotalStatsByAdUnits = createSelector(
	(state, { type, adUnitId }) => [
		selectAdvancedAnalyticsByType(state, type),
		{ adUnitId },
	],
	([analyticsByChannel, { adUnitId }]) =>
		Object.values(analyticsByChannel.byChannelStats || {}).reduce(
			(acc, curr) => acc + curr.reportChannelToAdUnit[adUnitId] || 0,
			0
		)
)

export const selectPublisherStatsByType = createSelector(
	(state, type) => selectAdvancedAnalyticsByType(state, type),
	({ publisherStats }) => publisherStats || {}
)
export const selectPublisherStatsByCountry = createSelector(
	(state, type) => selectPublisherStatsByType(state, type),
	({ reportPublisherToCountry }) => reportPublisherToCountry || {}
)

export const selectPublisherPayStatsByCountry = createSelector(
	(state, type) => selectPublisherStatsByType(state, type),
	({ reportPublisherToCountryPay }) => reportPublisherToCountryPay || {}
)

export const selectPublisherStatsAdUnit = createSelector(
	(state, type) => selectPublisherStatsByType(state, type),
	({ reportPublisherToAdUnit }) => reportPublisherToAdUnit || {}
)

export const selectPublisherStatsAdUnitPay = createSelector(
	(state, type) => selectPublisherStatsByType(state, type),
	({ reportPublisherToAdUnitPay }) => reportPublisherToAdUnitPay || {}
)

export const selectPublisherStatsAdSlot = createSelector(
	(state, type) => selectPublisherStatsByType(state, type),
	({ reportPublisherToAdSlot }) => reportPublisherToAdSlot || {}
)

export const selectPublisherStatsAdSlotPay = createSelector(
	(state, type) => selectPublisherStatsByType(state, type),
	({ reportPublisherToAdSlotPay }) => reportPublisherToAdSlotPay || {}
)

export const selectPublisherAggrStatsByCountry = createSelector(
	(state, type) => selectPublisherStatsByCountry(state, type),
	(byCountry = {}) => ({
		max: Math.max.apply(null, Object.values(byCountry)),
		total: Object.values(byCountry).reduce(
			(a, value) => a + (Number(value) || 0),
			0
		),
	})
)

export const selectAllAdUnitsInChannels = createSelector(
	state => selectChannelsWithUserBalancesAll(state),
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

export const selectPublisherTotalImpressions = createSelector(
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
)

export const selectCampaignAnalyticsByChannelStats = createSelector(
	(state, { type, campaignId } = {}) => [
		selectAdvancedAnalyticsByType(state, type),
		campaignId,
	],
	([analyticsByType, campaignId]) =>
		(analyticsByType.byChannelStats || {})[campaignId] || {}
)

export const selectCampaignAnalyticsByChannelToCountry = createSelector(
	(state, { type, campaignId } = {}) =>
		selectCampaignAnalyticsByChannelStats(state, { type, campaignId }),
	({ reportChannelToCountry }) => reportChannelToCountry || {}
)

export const selectCampaignAnalyticsByChannelToCountryPay = createSelector(
	(state, { type, campaignId } = {}) =>
		selectCampaignAnalyticsByChannelStats(state, { type, campaignId }),
	({ reportChannelToCountryPay }) => reportChannelToCountryPay || {}
)

export const selectCampaignAggrStatsByCountry = createSelector(
	(state, { type, campaignId } = {}) =>
		selectCampaignAnalyticsByChannelToCountry(state, { type, campaignId }),
	(byCountry = {}) => ({
		max: Math.max.apply(null, Object.values(byCountry)),
		total: Object.values(byCountry).reduce(
			(a, value) => a + (Number(value) || 0),
			0
		),
	})
)

export const selectCampaignAnalyticsByChannelToAdUnit = createSelector(
	(state, { type, campaignId } = {}) =>
		selectCampaignAnalyticsByChannelStats(state, { type, campaignId }),

	({ reportChannelToAdUnit }) => reportChannelToAdUnit || {}
)

export const selectMaxAdUnitStatByChannel = createSelector(
	(state, { type, campaignId } = {}) =>
		selectCampaignAnalyticsByChannelStats(state, { type, campaignId }),
	({ reportChannelToAdUnit }) =>
		reportChannelToAdUnit
			? Math.max.apply(null, Object.values(reportChannelToAdUnit))
			: 0
)

export const selectAnalyticsDataAggr = createSelector(
	[
		selectAnalytics,
		selectIdentitySideAnalyticsPeriod,
		(_, opts = {}) => opts,
		selectAnalyticsLiveTimestamp,
	],
	(
		analytics = {},
		{ start },
		{ side, eventType, metric, timeframe },
		liveTimestamp
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
)

export function selectCampaignEventsCount(type, campaignId) {
	return Object.values(
		// TODO: fix this selector w/o using getState
		selectCampaignAnalyticsByChannelToAdUnit(getState(), {
			type,
			campaignId,
		})
	).reduce((a, b) => a + b, 0)
}

export const selectTotalImpressions = createSelector(
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
)

export const selectTotalClicks = createSelector(
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
)

export const selectTotalMoney = createSelector(
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
)

export const selectTotalImpressionsWithPayouts = createSelector(
	(state, { side, timeframe } = {}) => [
		selectAnalyticsDataAggr(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventCounts',
		}),
		selectAnalyticsDataAggr(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventPayouts',
		}),
	],
	([eventCounts, eventPayouts]) =>
		eventCounts && eventPayouts
			? eventCounts
					.filter(
						c =>
							(eventPayouts.find(e => e.time === c.time) || { value: null })
								.value !== null
					)
					.reduce((a, { time, value }) => a + Number(value) || 0, 0)
			: null
)

export const selectAverageCPM = createSelector(
	[
		(state, { side, timeframe } = {}) =>
			selectTotalMoney(state, { side, timeframe }),
		(state, { side, timeframe } = {}) =>
			selectTotalImpressionsWithPayouts(state, { side, timeframe }),
	],
	(totalMoney, totalImpressions) =>
		totalMoney !== null && totalImpressions !== null
			? (1000 * Number(totalMoney)) / Number(totalImpressions)
			: null
)

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

export const selectStatsChartData = createSelector(
	[
		(state, { noLastOne, ...rest } = {}) => {
			return { data: selectAnalyticsDataAggr(state, rest), noLastOne, ...rest }
		},
	],
	({ data = [], noLastOne, metric, ...rest }) => {
		const aggr = noLastOne ? data.slice(0, -1) : data
		return aggr.reduce(
			(memo, item) => {
				const { time, value } = item
				memo.labels.push(formatDateTime(time))
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
)

export const selectChartDatapointsImpressions = createSelector(
	(state, { side, timeframe } = {}) => [
		selectStatsChartData(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventCounts',
			noLastOne: false,
		}),
	],
	([impressions]) => impressions
)

export const selectChartDatapointsClicks = createSelector(
	(state, { side, timeframe } = {}) => [
		selectStatsChartData(state, {
			side,
			timeframe,
			eventType: 'CLICK',
			metric: 'eventCounts',
			noLastOne: false,
		}),
	],
	([clicks]) => clicks
)

export const selectChartDatapointsPayouts = createSelector(
	(state, { side, timeframe } = {}) => [
		selectStatsChartData(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			metric: 'eventPayouts',
			noLastOne: false,
		}),
	],
	([payouts]) => payouts
)

export const selectChartDatapointsCPM = createSelector(
	(state, { side, timeframe } = {}) => [
		selectChartDatapointsPayouts(state, { side, timeframe }),
		selectChartDatapointsImpressions(state, { side, timeframe }),
	],
	([payouts, impressions]) => {
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
)

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
					dateUtils.getNearestSixHoursUTC(6, lastChecked),
					DEFAULT_DATETIME_FORMAT
				)
			default:
				return dateUtils.format(dateUtils.date(), DEFAULT_DATETIME_FORMAT)
		}
	}
)

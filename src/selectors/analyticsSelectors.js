import { getState } from 'store'
import { createSelector } from 'reselect'
import { selectChannelsWithUserBalancesAll } from 'selectors'
import { formatTokenAmount, formatDateTime } from 'helpers/formatters'
import { selectWebsites } from 'selectors'

export const selectAnalytics = state => state.persist.analytics

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

export const selectAnalyticsTimeframe = createSelector(
	selectAnalytics,
	({ timeframe }) => {
		return timeframe
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
	advancedByType => advancedByType.publisherStats || {}
)
export const selectPublisherStatsByCountry = createSelector(
	(state, type) => selectPublisherStatsByType(state, type),
	({ reportPublisherToCountry }) => reportPublisherToCountry || {}
)

export const selectPublisherStatsAdUnit = createSelector(
	(state, type) => selectPublisherStatsByType(state, type),
	({ reportPublisherToAdUnit }) => reportPublisherToAdUnit || {}
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
		Object.values(withBalanceAll).reduce((units, channel) => {
			channel.adUnits.forEach(u => {
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
	],
	([adUnits, impressionsByAdUnit]) =>
		Object.values(adUnits)
			.filter(i => impressionsByAdUnit[i.id] !== undefined)
			.map(item => ({
				...item,
				impressions: impressionsByAdUnit[item.id],
			}))
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
	({ reportChannelToCountry }) => {
		return reportChannelToCountry || {}
	}
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
	(state, { type, campaignId } = {}) => [
		selectCampaignAnalyticsByChannelStats(state, { type, campaignId }),
	],
	([{ reportChannelToAdUnit }]) => {
		return reportChannelToAdUnit || {}
	}
)

export const selectMaxAdUnitStatByChannel = createSelector(
	(state, { type, campaignId } = {}) =>
		selectCampaignAnalyticsByChannelStats(state, { type, campaignId }),
	({ reportChannelToAdUnit }) => {
		return reportChannelToAdUnit
			? Math.max.apply(null, Object.values(reportChannelToAdUnit))
			: 0
	}
)

export const selectAnalyticsDataAggr = createSelector(
	[selectAnalytics, (_, opts = {}) => opts],
	(analytics = {}, { side, eventType, metric, timeframe }) => {
		// return analytics[side]['eventType'][metric][timeframe].aggr
		// NOTE: It was working fine with default initial state but
		// when eventType CLICK was added if you were logged and had
		// old analytics the initialState is not applied === boom.

		const {
			[side]: {
				[eventType]: { [metric]: { [timeframe]: { aggr } = {} } = {} } = {},
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
			noLastOne: true,
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
			noLastOne: true,
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
			noLastOne: true,
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

export const selectPublisherRevenueNoticeActive = createSelector(
	[selectPublisherTotalImpressions, selectWebsites],
	(totalImpressions, websites) =>
		(websites.length && websites.some(w => w.issuss.length === 0)) ||
		!totalImpressions
)

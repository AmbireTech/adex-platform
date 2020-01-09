import { createSelector } from 'reselect'
import { formatTokenAmount, formatDateTime } from 'helpers/formatters'

export const selectAnalytics = state => state.persist.analytics

export const selectAnalyticsData = createSelector(
	[selectAnalytics, (_, side) => side],
	(analytics, side) => {
		return analytics[side] || {}
	}
)

export const selectAnalyticsDataAggr = createSelector(
	[selectAnalytics, (_, opts = {}) => opts],
	(analytics, { side, eventType, metric, timeframe }) => {
		return analytics[side][eventType][metric][timeframe].aggr
	}
)

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
					(a, { value }) => a + Number(formatTokenAmount(value, 18)) || 0,
					0
			  )
			: null
)

export const selectAverageCPM = createSelector(
	[
		(state, { side, timeframe } = {}) =>
			selectTotalMoney(state, { side, timeframe }),
		(state, { side, timeframe } = {}) =>
			selectTotalImpressions(state, { side, timeframe }),
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
				memo.datasets.push(parseValueByMetric({ value, metric }))
				return memo
			},
			{
				labels: [],
				datasets: [],
			}
		)
	}
)

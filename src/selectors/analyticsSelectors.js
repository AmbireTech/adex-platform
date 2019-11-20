import { createSelector } from 'reselect'
import { formatTokenAmount } from 'helpers/formatters'

export const selectAnalytics = state => state.persist.analytics

export const selectAnalyticsData = createSelector(
	[selectAnalytics, (_, side) => side],
	(analytics, side) => {
		return analytics[side] || {}
	}
)

export const selectAnalyticsDataAggr = createSelector(
	[selectAnalytics, (_, opts = {}) => opts],
	(analytics, { side, eventType, collection, timeframe }) => {
		return analytics[side][eventType][collection][timeframe].aggr
	}
)

export const selectTotalImpressions = createSelector(
	(state, { side, timeframe } = {}) =>
		selectAnalyticsDataAggr(state, {
			side,
			timeframe,
			eventType: 'IMPRESSION',
			collection: 'eventCounts',
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
			collection: 'eventPayouts',
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

import { createSelector } from 'reselect'
import { selectCampaignsArray, selectRoutineWithdrawTokens } from 'selectors'
import { formatTokenAmount } from 'helpers/formatters'

export const selectItems = state => state.persist.items

export const selectCampaignsTableData = createSelector(
	[selectCampaignsArray, (_, side) => side],
	(campaigns, side) =>
		campaigns.map(item => ({
			// media: {
			// 	id: item.id,
			// 	adUnits: item.adUnits,
			// },
			// status: {
			// 	humanFriendlyName: item.status.humanFriendlyName,
			// 	originalName: item.status.name,
			// },
			depositAmount: item.depositAmount || 0,
			fundsDistributedRatio: item.status.fundsDistributedRatio || 0,
			impressions: item.impressions || 0,
			clicks: item.clicks || 0,
			minPerImpression: item.spec.minPerImpression || 0,
			created: item.created,
			activeFrom: item.spec.withdrawPeriodStart,
			withdrawPeriodStart: item.spec.withdrawPeriodStart,
			// actions: {
			// 	to: `/dashboard/${side}/Campaign/${item.id}`,
			// },
		}))
)

export const selectCampaignsMaxImpressions = createSelector(
	selectCampaignsArray,
	campaigns =>
		Math.max.apply(null, campaigns.map(i => Number(i.impressions || 0)))
)

export const selectCampaignsMaxClicks = createSelector(
	selectCampaignsArray,
	campaigns => Math.max.apply(null, campaigns.map(i => Number(i.clicks || 0)))
)

export const selectCampaignsMaxDeposit = createSelector(
	[selectCampaignsArray, selectRoutineWithdrawTokens],
	(campaigns, tokens) =>
		Math.max.apply(
			null,
			campaigns.map(i => {
				const { decimals } = tokens[i.depositAsset] || 18
				return Number(formatTokenAmount(i.depositAmount, decimals) || 0)
			})
		)
)

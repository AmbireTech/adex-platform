import { createSelector } from 'reselect'
import { selectCampaignsArray, selectRoutineWithdrawTokens } from 'selectors'
import { formatTokenAmount } from 'helpers/formatters'
import { formatUnits } from 'ethers/utils'

export const selectItems = state => state.persist.items

export const selectCampaignsTableData = createSelector(
	[selectCampaignsArray, selectRoutineWithdrawTokens, (_, side) => side],
	(campaigns, tokens, side) =>
		campaigns.map(item => {
			const { decimals } = tokens[item.depositAsset] || 18
			return {
				media: {
					id: item.id,
					adUnits: item.adUnits,
				},
				status: {
					humanFriendlyName: item.status.humanFriendlyName,
					originalName: item.status.name,
				},
				depositAmount: Number(formatUnits(item.depositAmount || '0', decimals)),
				fundsDistributedRatio: item.status.fundsDistributedRatio || 0,
				impressions: Number(item.impressions || '0'),
				clicks: Number(item.clicks || '0'),
				minPerImpression:
					Number(formatUnits(item.spec.minPerImpression || '0', decimals)) *
					1000,
				created: item.created,
				activeFrom: item.spec.activeFrom,
				withdrawPeriodStart: item.spec.withdrawPeriodStart,
				actions: {
					to: `/dashboard/${side}/Campaign/${item.id}`,
				},
			}
		})
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

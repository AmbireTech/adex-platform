import { createSelector } from 'reselect'
import {
	selectCampaignsArray,
	selectRoutineWithdrawTokens,
	selectAdSlotsArray,
	selectAdUnits,
	creatArrayOnlyLengthChangeSelector,
} from 'selectors'
import { formatUnits } from 'ethers/utils'

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

export const selectCampaignsTableDataOnLengthChange = creatArrayOnlyLengthChangeSelector(
	selectCampaignsTableData,
	data => data
)

export const selectCampaignsMaxImpressions = createSelector(
	selectCampaignsArray,
	campaigns =>
		Math.max.apply(null, campaigns.map(i => Number(i.impressions || 0))) || 1
)

export const selectCampaignsMaxClicks = createSelector(
	selectCampaignsArray,
	campaigns =>
		Math.max.apply(null, campaigns.map(i => Number(i.clicks || 0))) || 1
)

export const selectCampaignsMaxDeposit = createSelector(
	[selectCampaignsArray, selectRoutineWithdrawTokens],
	(campaigns, tokens) =>
		Math.max.apply(
			null,
			campaigns.map(i => {
				const { decimals } = tokens[i.depositAsset] || 18
				return Number(formatUnits(i.depositAmount, decimals) || 0)
			})
		)
)

export const selectAdSlotsTableData = createSelector(
	[selectAdSlotsArray, (_, side) => side],
	(slots, side) =>
		slots.map(item => {
			return {
				media: {
					id: item.id,
					mediaUrl: item.fallbackUnit ? `ipfs://${item.fallbackUnit}` : '', //TODO: provide fallback image to slot
					mediaMime: 'image/jpeg',
				},
				title: item.title,
				type: item.type.replace('legacy_', ''),
				created: item.created,
				actions: {
					to: `/dashboard/${side}/AdSlot/${item.id}`,
					id: item.id,
				},
			}
		})
)

export const selectAdUnitsTableData = createSelector(
	[selectAdUnits, (_, side, items) => ({ side, items })],
	(units, { side, items }) =>
		Object.values(items || units).map(item => ({
			id: item.id,
			media: {
				id: item.id,
				mediaUrl: item.mediaUrl,
				mediaMime: item.mediaMime,
			},
			title: item.title || units[item.ipfs].title,
			type: item.type,
			created: item.created,
			actions: {
				to: `/dashboard/${side}/AdUnit/${item.id || item.ipfs}`,
				item,
			},
		}))
)

import { createSelector } from 'reselect'
import {
	selectCampaignsArray,
	selectRoutineWithdrawTokens,
	selectAdSlotsArray,
	selectAdUnits,
	creatArrayOnlyLengthChangeSelector,
	selectCampaignAnalyticsByChannelStats,
	selectCampaignEventsCount,
	selectCampaignAnalyticsByChannelToAdUnit,
	selectTotalStatsByAdUnits,
	selectCampaignUnitsById,
} from 'selectors'
import { formatUnits } from 'ethers/utils'

export const selectCampaignsTableData = createSelector(
	[selectCampaignsArray, selectRoutineWithdrawTokens, (_, side) => side],
	(campaigns, tokens, side) =>
		campaigns.map(item => {
			const { decimals = 18 } = tokens[item.depositAsset] || {}
			const { id, spec = {}, adUnits = [] } = item

			const firstUnit = adUnits[0] || {}

			return {
				media: {
					side: side,
					id: item.id,
					mediaUrl: firstUnit.mediaUrl || '',
					mediaMime: firstUnit.mediaMime || '',
				},
				title: item.title,
				status: {
					humanFriendlyName: item.status.humanFriendlyName,
					originalName: item.status.name,
				},
				depositAmount: Number(formatUnits(item.depositAmount || '0', decimals)),
				fundsDistributedRatio: item.status.fundsDistributedRatio || 0,
				impressions: selectCampaignEventsCount('IMPRESSION', item.id),
				clicks: selectCampaignEventsCount('CLICK', item.id),

				ctr:
					(selectCampaignEventsCount('CLICK', item.id) /
						selectCampaignEventsCount('IMPRESSION', item.id)) *
						100 || 0,

				minPerImpression: {
					id,
					minPerImpression:
						Number(
							formatUnits(
								spec.minPerImpression || item.minPerImpression || '0',
								decimals
							)
						) * 1000,
				},
				created: item.created,
				activeFrom: spec.activeFrom || item.activeFrom,
				withdrawPeriodStart:
					spec.withdrawPeriodStart || item.withdrawPeriodStart,
				actions: {
					side: side,

					id,
					receiptReady:
						(item.status.humanFriendlyName === 'Closed' ||
							item.status.humanFriendlyName === 'Completed') &&
						(item.status.name === 'Exhausted' ||
							item.status.name === 'Expired'),
				},
				id,
				receiptAvailable:
					item.status.humanFriendlyName === 'Closed' ||
					item.status.humanFriendlyName === 'Completed',
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
				const { decimals = 18 } = tokens[i.depositAsset] || {}
				return Number(formatUnits(i.depositAmount, decimals) || 0)
			})
		)
)

export const selectAdSlotsTableData = createSelector(
	[selectAdSlotsArray, (_, side) => side],
	(slots, side) =>
		slots.map(item => {
			const id = item.id || item.ipfs
			return {
				media: {
					id,
					mediaUrl: item.fallbackUnit ? `ipfs://${item.fallbackUnit}` : '', //TODO: provide fallback image to slot
					mediaMime: 'image/jpeg',
				},
				title: item.title,
				type: item.type.replace('legacy_', ''),
				created: item.created,
				actions: {
					to: `/dashboard/${side}/AdSlot/${id}`,
					item,
				},
			}
		})
)

export const selectAdUnitsTableData = createSelector(
	[
		(state, { side, campaignId }) => ({
			side,
			items: campaignId
				? selectCampaignUnitsById(state, campaignId)
				: selectAdUnits(state),
			impressionsByAdUnit: id =>
				campaignId
					? selectCampaignAnalyticsByChannelToAdUnit(state, {
							type: 'IMPRESSION',
							campaignId,
					  })[id]
					: selectTotalStatsByAdUnits(state, {
							type: 'IMPRESSION',
							adUnitId: id,
					  }),
			clicksByAdUnit: id =>
				campaignId
					? selectCampaignAnalyticsByChannelToAdUnit(state, {
							type: 'CLICK',
							campaignId,
					  })[id]
					: selectTotalStatsByAdUnits(state, {
							type: 'CLICK',
							adUnitId: id,
					  }),
		}),
	],
	({ side, items, impressionsByAdUnit, clicksByAdUnit }) =>
		Object.values(items).map(item => {
			const id = item.id || item.ipfs
			return {
				id,
				media: {
					id,
					mediaUrl: item.mediaUrl,
					mediaMime: item.mediaMime,
				},
				impressions: impressionsByAdUnit(id) || 0,
				clicks: clicksByAdUnit(id) || 0,
				ctr: (clicksByAdUnit(id) / impressionsByAdUnit(id)) * 100 || 0,
				title: item.title,
				type: item.type,
				created: item.created,
				actions: {
					to: `/dashboard/${side}/AdUnit/${id}`,
					item,
				},
			}
		})
)

export const selectBestEarnersTableData = createSelector(
	[
		state => ({
			items: [1], //TODO: select all items ,
		}),
	],
	({ items }) =>
		Object.values(items).map(item => {
			const id = item.id || item.ipfs
			return {
				id,
				media: {
					id,
					mediaUrl: item.mediaUrl, //TODO: get media url??
					mediaMime: item.mediaMime, //TODO: get media mime ??
				},
				earnings: 1, //TODO: get stats here and below
				impressions: 0,
				clicks: 0,
				ctr: 0,
			}
		})
)

export const selectCampaignStatsTableData = createSelector(
	(state, campaignId) => {
		return {
			impressions: selectCampaignAnalyticsByChannelStats(state, {
				type: 'IMPRESSION',
				campaignId,
			}),
			clicks: selectCampaignAnalyticsByChannelStats(state, {
				type: 'CLICK',
				campaignId,
			}),
		}
	},
	({ impressions, clicks }) => {
		const imprStats = impressions.reportChannelToHostname || {}
		const clickStats = clicks.reportChannelToHostname || {}
		const earnStats = impressions.reportChannelToHostnamePay || {}
		return Object.keys(imprStats).map(key => ({
			website: key,
			impressions: imprStats[key] || 0,
			ctr:
				(((clickStats[key] || 0) / (imprStats[key] || 0)) * 100).toFixed(2) ||
				0,
			earnings: Number((earnStats[key] || 0).toFixed(2)),
			clicks: clickStats[key] || 0,
		}))
	}
)

export const selectCampaignTotalValues = createSelector(
	(state, channelId) => selectCampaignStatsTableData(state, channelId),
	data =>
		data.reduce(
			(result, current) => {
				const newResult = { ...result }
				newResult.totalClicks += current.clicks
				newResult.totalImpressions += current.impressions
				newResult.totalEarnings += current.earnings
				return newResult
			},
			{ totalClicks: 0, totalImpressions: 0, totalEarnings: 0 }
		)
)

export const selectCampaignStatsMaxValues = createSelector(
	(state, channelId) => selectCampaignStatsTableData(state, channelId),
	data =>
		data.reduce(
			(result, current) => {
				const newResult = { ...result }

				newResult.maxClicks = Math.max(current.clicks, newResult.maxClicks)
				newResult.maxCTR = Math.max(current.ctr, newResult.maxCTR)
				newResult.maxImpressions = Math.max(
					current.impressions,
					newResult.maxImpressions
				)
				newResult.maxEarnings = Math.max(
					current.earnings,
					newResult.maxEarnings
				)
				return newResult
			},
			{ maxClicks: 0, maxImpressions: 0, maxEarnings: 0, maxCTR: 0 }
		)
)

export const selectAdUnitsStatsMaxValues = createSelector(
	(state, { side, items, campaignId }) =>
		selectAdUnitsTableData(state, { side, items, campaignId }),
	data =>
		data.reduce(
			(result, current) => {
				const newResult = { ...result }

				newResult.maxClicks = Math.max(current.clicks, newResult.maxClicks)
				newResult.maxCTR = Math.max(current.ctr, newResult.maxCTR)
				newResult.maxImpressions = Math.max(
					current.impressions,
					newResult.maxImpressions
				)
				return newResult
			},
			{ maxClicks: 0, maxImpressions: 0, maxCTR: 0 }
		)
)

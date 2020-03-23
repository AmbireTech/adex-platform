import { createSelector } from 'reselect'
import ISOCountries from 'i18n-iso-countries'
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
	selectPublisherAdvanceStatsToAdUnit,
	selectPublisherStatsByCountry,
	selectCampaignAnalyticsByChannelToCountry,
} from 'selectors'
import { formatUnits } from 'ethers/utils'
import chartCountriesData from 'world-atlas/countries-50m.json'
import { scaleLinear } from 'd3-scale'
const COUNTRY_NAMES = ISOCountries.getNames('en')

export const selectCampaignsTableData = createSelector(
	[selectCampaignsArray, selectRoutineWithdrawTokens, (_, side) => side],
	(campaigns, tokens, side) =>
		campaigns.map(item => {
			const { decimals = 18 } = tokens[item.depositAsset] || {}
			const { id, spec = {}, adUnits = [] } = item

			const firstUnit = adUnits[0] || {}

			const to = `/dashboard/${side}/campaigns/${id}`
			const toReceipt = `/dashboard/${side}/receipt/${id}`

			return {
				media: {
					side,
					id,
					mediaUrl: firstUnit.mediaUrl || '',
					mediaMime: firstUnit.mediaMime || '',
					to,
				},
				title: item.title,
				status: {
					humanFriendlyName: item.status.humanFriendlyName,
					originalName: item.status.name,
				},
				depositAmount: Number(formatUnits(item.depositAmount || '0', decimals)),
				fundsDistributedRatio: item.status.fundsDistributedRatio || 0,
				impressions: selectCampaignEventsCount('IMPRESSION', id),
				clicks: selectCampaignEventsCount('CLICK', id),

				ctr:
					(selectCampaignEventsCount('CLICK', id) /
						selectCampaignEventsCount('IMPRESSION', id)) *
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
					side,

					id,
					to,
					toReceipt,
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
			const to = `/dashboard/${side}/slots/${id}`
			return {
				media: {
					id,
					mediaUrl: item.fallbackUnit ? `ipfs://${item.fallbackUnit}` : '', //TODO: provide fallback image to slot
					mediaMime: 'image/jpeg',
					to,
				},
				title: item.title,
				type: item.type.replace('legacy_', ''),
				created: item.created,
				actions: {
					to,
					item,
				},
			}
		})
)

export const selectAdUnitsTableData = createSelector(
	[
		(state, { side, campaignId, items }) => ({
			side,
			items:
				items ||
				(campaignId
					? selectCampaignUnitsById(state, campaignId)
					: selectAdUnits(state)),
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
			const to = `/dashboard/${side}/units/${id}`
			return {
				id,
				media: {
					id,
					mediaUrl: item.mediaUrl,
					mediaMime: item.mediaMime,
					to,
				},
				impressions: impressionsByAdUnit(id) || 0,
				clicks: clicksByAdUnit(id) || 0,
				ctr: (clicksByAdUnit(id) / impressionsByAdUnit(id)) * 100 || 0,
				title: item.title,
				type: item.type,
				created: item.created,
				actions: {
					to,
					item,
				},
			}
		})
)

export const selectPublisherStatsByCountryTableData = createSelector(
	selectPublisherStatsByCountry,
	countries =>
		Object.keys(countries).map(key => {
			return {
				countryCode: key.toUpperCase(), //Need uppercase for GeoChart
				countryName: COUNTRY_NAMES[key],
				impressions: countries[key],
				countryId: ISOCountries.alpha2ToNumeric(key),
			}
		})
)

export const selectPublisherStatsByCountryMapChartData = createSelector(
	selectPublisherStatsByCountry,
	countries => {
		const chartData = { ...chartCountriesData }
		let maxImpressions = 0
		chartData.objects.countries.geometries = chartCountriesData.objects.countries.geometries.map(
			data => {
				const id = ISOCountries.numericToAlpha2(data.id)
				const impressions = countries[id] || 0
				const name = COUNTRY_NAMES[id] || data.name

				maxImpressions = Math.max(maxImpressions, impressions)

				const properties = {
					impressions,
					name,
				}

				return { ...data, properties }
			}
		)

		const colorScale = scaleLinear()
			.domain([0, maxImpressions])
			// TODO: set colors
			.range(['lightblue', 'blue'])

		return { chartData, colorScale }
	}
)

export const selectCampaignAnalyticsToCountryTableData = createSelector(
	(state, { campaignId }) =>
		selectCampaignAnalyticsByChannelToCountry(state, {
			type: 'IMPRESSION',
			campaignId,
		}),
	countries =>
		Object.keys(countries).map(key => {
			const countryNames = ISOCountries.getNames('en')
			return {
				countryCode: key.toUpperCase(), //Need uppercase for GeoChart
				countryName: countryNames[key],
				impressions: countries[key],
			}
		})
)

export const selectBestEarnersTableData = createSelector(
	selectPublisherAdvanceStatsToAdUnit,
	([items]) =>
		items
			? items.map(item => {
					const id = item.id || item.ipfs
					return {
						id,
						media: {
							id,
							mediaUrl: item.mediaUrl,
							mediaMime: item.mediaMime,
						},
						type: item.type,
						impressions: item.impressions,
					}
			  })
			: []
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

export const selectCountryStatsMaxValues = createSelector(
	selectPublisherStatsByCountryTableData,
	data =>
		data.reduce(
			(result, current) => {
				const newResult = { ...result }
				newResult.totalImpressions += current.impressions
				newResult.maxImpressions = Math.max(
					current.impressions,
					newResult.maxImpressions
				)
				return newResult
			},
			{ maxImpressions: 0, totalImpressions: 0 }
		)
)

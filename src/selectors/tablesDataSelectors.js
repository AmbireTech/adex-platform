import { createSelector } from 'reselect'
import { createCachedSelector } from 're-reselect'
import {
	t,
	selectCampaignsArray,
	selectRoutineWithdrawTokens,
	selectAdSlotsArray,
	selectAdUnits,
	creatArrayOnlyLengthChangeSelector,
	selectCampaignAnalyticsByChannelStats,
	selectCampaignAnalyticsByChannelToAdUnit,
	selectCampaignUnitsById,
	selectMainToken,
	selectAnalytics,
	selectPublisherAdvanceStatsToAdUnit,
	selectPublisherStatsByCountry,
	selectCampaignAnalyticsByChannelToCountry,
	selectCampaignAnalyticsByChannelToCountryPay,
	selectPublisherAggrStatsByCountry,
	selectCampaignAggrStatsByCountry,
	selectPublisherPayStatsByCountry,
	selectPublisherAdvanceStatsToAdSlot,
	selectSavedAudiences,
	selectAudienceByCampaignId,
	selectSide,
	selectAdUnitsTotalStats,
	selectCampaignsEventCountsStats,
} from 'selectors'
import { utils } from 'ethers'
import chartCountriesData from 'world-atlas/countries-50m.json'
import { scaleLinear } from 'd3-scale'
import { formatAbbrNum } from 'helpers/formatters'
import {
	PRIMARY_DARKEST,
	PRIMARY_LIGHTEST,
	SECONDARY,
	SECONDARY_LIGHT,
} from 'components/App/themeMUi'
import { grey } from '@material-ui/core/colors'
import { constants, helpers } from 'adex-models'
const { CountryNames, numericToAlpha2 } = constants
const { pricingBondsToUserInputPerMile } = helpers

export const selectCampaignsTableData = createSelector(
	[
		selectCampaignsEventCountsStats,
		selectCampaignsArray,
		selectRoutineWithdrawTokens,
		selectSide,
	],
	(eventCounts, campaigns, tokens, side) => {
		return campaigns
			.filter(x => !x.archived)
			.map(item => {
				const { decimals = 18 } = tokens[item.depositAsset] || {}
				const {
					id,
					spec = {},
					adUnits = [],
					status,
					pricingBoundsCPMUserInput,
					specPricingBounds,
				} = item

				const firstUnit = adUnits[0] || {}

				const to = `/dashboard/${side}/campaigns/${id}`
				const toReceipt = `/dashboard/${side}/receipt/${id}`

				const cpm =
					pricingBoundsCPMUserInput ||
					pricingBondsToUserInputPerMile({
						pricingBounds: specPricingBounds.IMPRESSION
							? specPricingBounds
							: {
									IMPRESSION: {
										min: item.minPerImpression || spec.minPerImpression,
										max: item.maxPerImpression || spec.maxPerImpression,
									},
							  },
						decimals,
					})

				const { impressions = 0, clicks = 0 } = eventCounts[id] || {}

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
						status,
						id,
					},
					depositAmount: Number(
						utils.formatUnits(item.depositAmount || '0', decimals)
					),
					fundsDistributedRatio: item.status.fundsDistributedRatio || 0,
					impressions,
					clicks,

					ctr: (clicks / impressions) * 100 || 0,
					minPerImpression: Number(cpm.IMPRESSION.min),

					maxPerImpression: Number(cpm.IMPRESSION.max),
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
	}
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
				return Number(utils.formatUnits(i.depositAmount, decimals) || 0)
			})
		)
)

export const selectAdSlotsTableData = createSelector(
	[selectAdSlotsArray, selectPublisherAdvanceStatsToAdSlot, selectSide],
	(
		slots,
		{
			impressionsByAdSlot,
			clicksByAdSlot,
			impressionsPayByAdSlot,
			clicksPayByAdSlot,
		},
		side
	) =>
		slots
			.filter(x => !x.archived)
			.map(item => {
				const id = item.id || item.ipfs
				const to = `/dashboard/${side}/slots/${id}`

				const { title, mediaUrl, mediaMime, type, created } = item

				const clicks = clicksByAdSlot[id]
				const impressions = impressionsByAdSlot[id]
				return {
					media: {
						id,
						mediaUrl,
						mediaMime,
						to,
					},
					title: title,
					type: type.replace('legacy_', ''),
					created: created,
					impressions,
					clicks,
					ctr: ((clicks || 0) / (impressions || 1)) * 100,
					earnings:
						Number(impressionsPayByAdSlot[id] || 0) +
						Number(clicksPayByAdSlot[id] || 0),
					actions: {
						to,
						item,
						id,
						title,
					},
				}
			})
)

const getTabledData = ({
	selectOnImage,
	side,
	items,
	impressionsByAdUnit,
	clicksByAdUnit,
}) => {
	return Object.values(items)
		.filter(x => !x.archived)
		.map(item => {
			const id = item.id || item.ipfs
			const to = `/dashboard/${side}/units/${id}`
			const { title, mediaUrl, mediaMime, type, created } = item

			const impressions = impressionsByAdUnit(id)
			const clicks = clicksByAdUnit(id) || 0
			return {
				id,
				media: {
					selectOnImage,
					id,
					mediaUrl,
					mediaMime,
					to,
				},
				impressions,
				clicks,
				ctr: (clicks / (impressions || 1)) * 100 || 0,
				title,
				type,
				created,
				actions: {
					id,
					title,
					to,
					item,
				},
			}
		})
}

export const selectAllAdUnitsTableData = createSelector(
	[selectAdUnits, selectSide, selectAdUnitsTotalStats],
	(items, side, adUnitsTotalStats) =>
		getTabledData({
			items,
			side,
			impressionsByAdUnit: id => adUnitsTotalStats.IMPRESSION[id],
			clicksByAdUnit: id => adUnitsTotalStats.CLICK[id],
		})
)

export const selectAdUnitsByCampaignTableData = createCachedSelector(
	selectCampaignUnitsById,
	selectSide,
	(state, campaignId) => id => {
		return selectCampaignAnalyticsByChannelToAdUnit(
			state,
			'IMPRESSION',
			campaignId
		)[id]
	},
	(state, campaignId) => id => {
		return selectCampaignAnalyticsByChannelToAdUnit(state, 'CLICK', campaignId)[
			id
		]
	},
	(items, side, impressionsByAdUnit, clicksByAdUnit) =>
		getTabledData({
			items,
			side,
			impressionsByAdUnit,
			clicksByAdUnit,
		})
)((_state, campaignId) => campaignId)

export const selectAdUnitsByItemsTableData = createCachedSelector(
	(_state, items) => items,
	selectSide,
	selectAdUnitsTotalStats,
	(items, side, adUnitsToatalStats) =>
		getTabledData({
			selectOnImage: true,
			items,
			side,
			impressionsByAdUnit: id => adUnitsToatalStats.IMPRESSION[id],
			clicksByAdUnit: id => adUnitsToatalStats.CLICK[id],
		})
)((_state, items) => items.map(x => x.id).join(':'))

export const selectAdUnitsTableData = createCachedSelector(
	(state, { campaignId, items }) =>
		!!items
			? selectAdUnitsByItemsTableData(state, items)
			: campaignId
			? selectAdUnitsByCampaignTableData(state, campaignId)
			: selectAllAdUnitsTableData(state),

	data => data
)(
	(_state, { campaignId, items }) =>
		campaignId || (items || []).map(x => x.id).join(':') || 'all'
)

export const selectAudiencesTableData = createSelector(
	[selectSavedAudiences],
	audiences =>
		audiences
			.filter(x => !x.archived)
			.map(item => {
				const { id, title, inputs, version, created, updated } = item

				const to = `/dashboard/advertiser/audiences/${id}`

				return {
					title: {
						title: title || id,
						to,
					},
					created,
					updated,
					actions: {
						id,
						audienceInput: { inputs, version },
						title,
						to: `/dashboard/advertiser/audiences/${id}`,
					},
				}
			})
)

const mapByCountryTableData = ({
	impressionsByCountry,
	clicksByCountry,
	impressionsAggrByCountry,
	impressionsPayByCountry,
	clicksPayByCountry,
} = {}) => {
	const addEarnings = impressionsPayByCountry && clicksPayByCountry
	// NOTE: assume that there are no click without impressions
	return Object.keys(impressionsByCountry).map(key => {
		return {
			countryName: CountryNames[key],
			impressions: impressionsByCountry[key] || 0,
			percentImpressions:
				((impressionsByCountry[key] || 0) /
					(impressionsAggrByCountry.total || 1)) *
				100,
			clicks: clicksByCountry[key] || 0,

			ctr:
				((clicksByCountry[key] || 0) / (impressionsByCountry[key] || 1)) * 100,
			...(addEarnings && {
				earnings:
					(impressionsPayByCountry[key] || 0) + (clicksPayByCountry[key] || 0),
				averageCPM:
					(Number(impressionsPayByCountry[key] || 0) /
						Number(impressionsByCountry[key] || 1)) *
					1000,
			}),
		}
	})
}

export const selectPublisherStatsByCountryData = createSelector(
	[
		state => selectPublisherStatsByCountry(state, 'IMPRESSION'),
		state => selectPublisherStatsByCountry(state, 'CLICK'),
		state => selectPublisherAggrStatsByCountry(state, 'IMPRESSION'),
		state => selectPublisherPayStatsByCountry(state, 'IMPRESSION'),
		state => selectPublisherPayStatsByCountry(state, 'CLICK'),
	],
	(
		impressionsByCountry,
		clicksByCountry,
		impressionsAggrByCountry,
		impressionsPayByCountry,
		clicksPayByCountry
	) => ({
		impressionsByCountry,
		clicksByCountry,
		impressionsAggrByCountry,
		impressionsPayByCountry,
		clicksPayByCountry,
	})
)

export const selectCampaignAnalyticsToCountryData = createCachedSelector(
	(state, campaignId) => {
		return [
			selectCampaignAnalyticsByChannelToCountry(
				state,
				'IMPRESSION',
				campaignId
			),
			selectCampaignAnalyticsByChannelToCountry(state, 'CLICK', campaignId),
			selectCampaignAggrStatsByCountry(state, campaignId, 'IMPRESSION'),
			selectCampaignAnalyticsByChannelToCountryPay(
				state,
				'IMPRESSION',
				campaignId
			),
			selectCampaignAnalyticsByChannelToCountryPay(state, 'CLICK', campaignId),
		]
	},
	([
		impressionsByCountry,
		clicksByCountry,
		impressionsAggrByCountry,
		impressionsPayByCountry,
		clicksPayByCountry,
	]) => {
		return {
			impressionsByCountry,
			clicksByCountry,
			impressionsAggrByCountry,
			impressionsPayByCountry,
			clicksPayByCountry,
		}
	}
)((_state, campaignId) => campaignId)

export const selectPublisherStatsByCountryTableData = createSelector(
	selectPublisherStatsByCountryData,
	data => mapByCountryTableData(data)
)

export const selectCampaignAnalyticsToCountryTableData = createCachedSelector(
	selectCampaignAnalyticsToCountryData,
	data => mapByCountryTableData(data)
)((_state, campaignId) => campaignId)

const mapByCountryMapChartData = ({
	impressionsByCountry,
	clicksByCountry,
	impressionsAggrByCountry,
} = {}) => {
	const colorScale = scaleLinear()
		.domain([0, impressionsAggrByCountry.max])
		.range([PRIMARY_LIGHTEST, PRIMARY_DARKEST])

	const hoverColor = SECONDARY
	const pressedColor = SECONDARY_LIGHT
	const chartData = { ...chartCountriesData }

	chartData.objects.countries.geometries = chartCountriesData.objects.countries.geometries.map(
		data => {
			const id = numericToAlpha2(data.id)
			const impressions = impressionsByCountry[id] || 0
			const clicks = clicksByCountry[id] || 0
			const name = CountryNames[id] || data.name
			const percentImpressions =
				((impressions || 0) / impressionsAggrByCountry.total) * 100 || 0
			const ctr = ((clicks || 0) / (impressions || 1)) * 100 || 0
			const tooltipElements = [
				`${name}:`,
				`${t('LABEL_IMPRESSIONS')}: ${formatAbbrNum(impressions, 2)}`,
				`${t('LABEL_CLICKS')}: ${formatAbbrNum(clicks, 2)}`,
				`${t('LABEL_PERC')}: ${percentImpressions.toFixed(2)} %`,
				`${t('LABEL_CTR')}: ${ctr.toFixed(4)} %`,
			]

			const fillColor = impressions > 0 ? colorScale(impressions) : grey[400]

			const properties = {
				name,
				fillColor,
				tooltipElements,
			}

			return { ...data, properties }
		}
	)

	return { chartData, hoverColor, pressedColor }
}

export const selectPublisherStatsByCountryMapChartData = createSelector(
	[selectPublisherStatsByCountryData],
	data => mapByCountryMapChartData(data)
)

export const selectCampaignAnalyticsToCountryMapChartData = createCachedSelector(
	selectCampaignAnalyticsToCountryData,
	data => mapByCountryMapChartData(data)
)((_state, campaignId) => campaignId)

export const selectBestEarnersTableData = createSelector(
	selectPublisherAdvanceStatsToAdUnit,
	items =>
		items.map(item => {
			const {
				id,
				mediaUrl,
				mediaMime,
				type,
				impressions,
				clicks,
				impressionsPay,
				clicksPay,
			} = item
			return {
				id,
				media: {
					id,
					mediaUrl,
					mediaMime,
				},
				type,
				impressions,
				clicks,
				ctr: ((clicks || 0) / (impressions || 1)) * 100,
				earnings: impressionsPay + clicksPay,
			}
		})
)

export const selectCampaignStatsTableData = createCachedSelector(
	selectAnalytics, // temp fix to update campaign analytics daat
	selectAudienceByCampaignId,
	(state, campaignId) =>
		selectCampaignAnalyticsByChannelStats(state, 'IMPRESSION', campaignId),
	(state, campaignId) =>
		selectCampaignAnalyticsByChannelStats(state, 'CLICK', campaignId),
	(_advanced, campaignAudienceInput, impressions, clicks) => {
		const imprStats = impressions.reportChannelToHostname || {}
		const clickStats = clicks.reportChannelToHostname || {}
		const earnStats = impressions.reportChannelToHostnamePay || {}

		const rules = campaignAudienceInput
			? campaignAudienceInput.inputs.publishers
			: null

		return Object.keys(imprStats).map(key => ({
			isBlacklisted:
				rules &&
				((rules.apply === 'nin' &&
					(rules.nin || []).some(x => x.includes(key))) ||
					(rules.apply === 'ni' &&
						!(rules.in || []).some(x => x.includes(key)))),

			website: key,
			impressions: imprStats[key] || 0,
			ctr: ((clickStats[key] || 0) / (imprStats[key] || 1)) * 100,
			earnings: Number(earnStats[key] || 0),
			averageCPM:
				(Number(earnStats[key] || 0) / Number(imprStats[key] || 1)) * 1000,
			clicks: clickStats[key] || 0,
		}))
	}
)((_state, campaignId) => campaignId)

export const selectCampaignTotalValues = createCachedSelector(
	selectCampaignStatsTableData,
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
)((_state, { campaignId }) => campaignId)

export const selectCampaignStatsMaxValues = createCachedSelector(
	selectCampaignStatsTableData,
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
)((_state, campaignId) => campaignId)

export const selectAdUnitsStatsMaxValues = createCachedSelector(
	(state, { campaignId, items }) =>
		!!items
			? selectAdUnitsByItemsTableData(state, items)
			: campaignId
			? selectAdUnitsByCampaignTableData(state, campaignId)
			: selectAllAdUnitsTableData(state),
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
)(
	(_state, { campaignId, items }) =>
		campaignId || (items || []).map(x => x.id).join(':') || 'all'
)

export const selectPublisherReceiptsStatsByMonthTableData = createCachedSelector(
	selectAnalytics,
	selectMainToken,
	(_state, date) => date,
	({ receipts }, token, date) => {
		const result = []
		if (receipts && receipts[date]) {
			const { decimals = 18 } = token || {}
			for (let [key, value] of Object.entries(receipts[date])) {
				result.push({
					impressions: value.impressions,
					payouts: Number(utils.formatUnits(value.payouts || '0', decimals)),
					date: +key,
				})
			}
		}
		return result
	}
)((_state, date) => date)

export const selectPublisherReceiptsStatsByMonthTotalValues = createSelector(
	[selectPublisherReceiptsStatsByMonthTableData],
	data =>
		data.reduce(
			(result, current) => {
				const newResult = { ...result }
				newResult.totalPayouts += +current.payouts
				newResult.totalImpressions += +current.impressions
				return newResult
			},
			{ totalPayouts: 0, totalImpressions: 0 }
		)
)

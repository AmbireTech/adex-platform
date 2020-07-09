import React, { useEffect, useState } from 'react'
import { bigNumberify, parseUnits, formatUnits } from 'ethers/utils'
import {
	t,
	selectDemandAnalytics,
	selectMainToken,
	selectWebsitesArray,
	selectTargetingCategoriesByType,
	selectTargetingPublishersByType,
	selectNewItemByTypeAndId,
	selectValidationsById,
	selectAllTargetingPublishers,
	selectTargetingCategories,
	selectVerifiedActiveTargetingAnalytics,
} from 'selectors'
import { createSelector } from 'reselect'
import { constants, IabCategories } from 'adex-models'
import { WHERE_YOU_KNOW_US } from 'constants/misc'
import { ExternalAnchor } from 'components/common/anchor/anchor'
import moment from 'moment'

export const selectSlotTypesSourceWithDemands = createSelector(
	[selectDemandAnalytics, selectMainToken],
	(demand, { symbol }) => {
		const { source } = constants.AdUnitsTypes.map(type => {
			return {
				value: type,
				label: type.split('_')[1],
				demand: demand[type],
			}
		})
			.sort((a, b) => {
				const dA = bigNumberify(a.demand ? a.demand.raw.avgCPM : 0)
				const dB = bigNumberify(b.demand ? b.demand.raw.avgCPM : 0)

				return dA.gt(dB) ? -1 : dB.gt(dA) ? 1 : 0
			})
			.reduce(
				(data, type, index) => {
					const newData = { ...data }
					const source = newData.source
					const current = type
					if (index === 0 && type.demand) {
						newData.hasPopularGroup = true
						source.push({ group: t('POPULAR_SLOTS_TYPES') })
					}
					if (
						!newData.hasNoDemandGroup &&
						newData.hasPopularGroup &&
						index !== 0 &&
						!type.demand
					) {
						newData.hasNoDemandGroup = true
						source.push({ group: t('NO_DEMAND_SLOTS_TYPES') })
					}

					if (current.demand) {
						const demandIfo = t('SLOT_TYPE_DEMAND_INFO', {
							args: [
								current.demand.formatted.avgCPM,
								symbol,
								current.demand.formatted.totalVolume,
								symbol,
							],
						})
						current.label = `${current.label} (${demandIfo})`
					}
					source.push(current)

					newData.source = source

					return newData
				},
				{ source: [], hasPopularGroup: false, hasNoDemandGroup: false }
			)
		return source
	}
)

export const selectVerifiedActiveTypes = createSelector(
	[selectVerifiedActiveTargetingAnalytics, selectMainToken],
	(targetingAnalytics, { decimals }) => {
		const verified = targetingAnalytics.reduce((types, data) => {
			data.types.forEach(t => {
				const typeData = types.get(t) || {
					byOwner: {},
					minSlotCount: 1,
				}

				typeData.byOwner[data.owner] = typeData.byOwner[data.owner] || {}
				// As totalEarned is by owner we need it once
				typeData.byOwner[data.owner].revenue =
					typeData.byOwner[data.owner].revenue || data.totalEarned || '0'

				typeData.byOwner[data.owner].campaignsEarnedFrom =
					typeData.byOwner[data.owner].campaignsEarnedFrom ||
					data.campaignsEarnedFrom ||
					1
				types.set(t, typeData)
			})

			return types
		}, new Map())

		verified.forEach((value, key) => {
			const totalRevenue = Object.values(value.byOwner).reduce(
				(total, r = {}) => total.add(bigNumberify(r.revenue || '0')),
				bigNumberify('0')
			)

			verified.set(key, {
				revenue: parseFloat(formatUnits(totalRevenue.toString(), decimals)),
			})
		})

		return verified
	}
)

export const selectUnitTypesSourceWithRecommendations = createSelector(
	[selectVerifiedActiveTypes, selectMainToken],
	(verifiedTypes, { symbol } = {}) => {
		const totoShare = Array.from(verifiedTypes.values()).reduce(
			(total, { revenue = 0 }) => total + revenue,
			1
		)

		const { source } = constants.AdUnitsTypes.map(type => ({
			value: type,

			revenue: verifiedTypes.get(type).revenue,
		}))
			.sort((a, b) => {
				return b.revenue - a.revenue
			})
			.reduce(
				(data, type, index) => {
					const newData = { ...data }
					const source = newData.source
					const { revenue, ...typeRest } = type
					const current = { ...typeRest }
					current.label = current.value.split('_')[1]
					if (index === 0 && revenue > 0) {
						newData.hasPopularGroup = true
						source.push({ group: t('MOST_POPULAR_UNITS_TYPES') })
					}

					const share = revenue / totoShare
					if (
						!newData.hasLessPopularGroup &&
						newData.hasPopularGroup &&
						index !== 0 &&
						share <= 0.01 // less than 1%
					) {
						newData.hasLessPopularGroup = true
						source.push({ group: t('LESS_POPULAR_UNITS_TYPES') })
					}

					source.push(current)

					newData.source = source

					return newData
				},
				{
					source: [],
					hasPopularGroup: false,
					hasLessPopularGroup: false,
				}
			)

		return source
	}
)

export const selectMonthsRange = createSelector(
	[
		(startDate, endDate) => ({
			startDate,
			endDate,
		}),
	],
	({ startDate, endDate }) => {
		const months = []
		for (
			var m = moment(startDate).startOf('month');
			m.diff(moment(endDate).startOf('month')) <= 0;
			m.add(1, 'month')
		) {
			months.push(+m)
		}
		return months
	}
)

export const selectReceiptMonths = createSelector(
	[selectMonthsRange, (_, __, monthsEnd) => monthsEnd],
	(months, monthsEnd) =>
		months.map(monthTimestamp => ({
			value: monthTimestamp,
			label: !!monthsEnd
				? moment(monthTimestamp)
						.endOf('month')
						.format('Do MMMM, YYYY')
				: moment(monthTimestamp).format('Do MMMM, YYYY'),
		}))
)

export const selectFromSource = createSelector(
	labelValueMapping => labelValueMapping,
	source =>
		source.map(data => {
			const translated = { ...data }
			translated.label = t(data.label)
			return translated
		})
)

export const selectKnowUsFromSource = createSelector(
	() => selectFromSource(WHERE_YOU_KNOW_US),
	source => source
)

export const selectTargetingSources = createSelector(
	sources => sources,
	sources =>
		Object.entries(sources).map(([key, { collection }], index) => {
			return {
				value: {
					key: key + index,
					source: key,
					collection,
					target: { tag: '', score: 1 },
					label: t(`TARGET_LABEL_${key.toUpperCase()}`),
					placeholder: t(`TARGET_LABEL_${key.toUpperCase()}`),
				},
				label: t(`ADD_NEW_${key.toUpperCase()}_TARGET`),
			}
		})
)

const autocompleteLocationsSingleSelect = () => {
	const tiers = Object.values(constants.CountryTiers).map(
		({ name, ruleValue, countries } = {}) => ({
			label: t(name),
			extraLabel: countries.join(', '),
			value: ruleValue,
			group: t('BY_TIER'),
		})
	)
	const all = constants.AllCountries.map(({ name, ruleValue } = {}) => ({
		label: t(name),
		value: ruleValue,
		group: name[0].toUpperCase(),
	}))

	return [...tiers, ...all]
}

const autocompleteCategoriesMultiSelectIn = createSelector(
	[selectTargetingCategoriesByType],
	categories =>
		[{ label: t('ALL_CATEGORIES'), value: 'ALL' }].concat(
			categories.map(cat => ({
				label: t(IabCategories.wrbshrinkerWebsiteApiV3Categories[cat] || cat),
				value: cat,
			}))
		)
)

const autocompleteCategoriesMultiSelectNin = createSelector(
	[selectTargetingCategories],
	categories =>
		categories.map(cat => ({
			label: t(IabCategories.wrbshrinkerWebsiteApiV3Categories[cat] || cat),
			value: cat,
		}))
)

const getPublisherExtraDataLabel = publisher => [
	`${t('HOSTNAME')}: ${publisher.hostname}`,
	`${t('ALEXA_RANK')}: ${publisher.alexaRank || '-'}`,
	`${t('CATEGORIES')}: ${(publisher.categories || [])
		.map(
			cat => `"${IabCategories.wrbshrinkerWebsiteApiV3Categories[cat] || cat}"`
		)
		.join(', ')}`,
]

const autocompletePublishersMultiSelectIn = createSelector(
	[selectTargetingPublishersByType],
	publishers =>
		publishers.map(pub => ({
			label: pub.hostname,
			value: JSON.stringify({ hostname: pub.hostname, publisher: pub.owner }),
			extraLabel: getPublisherExtraDataLabel(pub),
			extraData: pub,
		}))
)

const autocompletePublishersMultiSelectNin = createSelector(
	[selectAllTargetingPublishers],
	publishers =>
		publishers.map(pub => ({
			label: pub.hostname,
			value: JSON.stringify({ hostname: pub.hostname, publisher: pub.owner }),
			extraLabel: getPublisherExtraDataLabel(pub),
			extraData: pub,
		}))
)

export const audienceSources = () => [
	{
		parameter: 'location',
		applyType: 'single',
		actions: [
			{ type: 'in', label: t('TARGET_COUNTRIES'), minSelected: 1 },
			{ type: 'nin', label: t('EXCLUDED_COUNTRIES'), minSelected: 1 },
			{ type: 'allin', label: t('SHOW_EVERYWHERE'), value: 'ALL' },
		],
	},
	{
		parameter: 'categories',
		applyType: 'multiple',
		actions: [
			{ type: 'in', label: t('SHOW_SELECTED'), minSelected: 1 },
			{
				type: 'nin',
				label: t('DONT_SHOW_SELECTED'),
				minSelected: 1,
				disabledValues: ['ALL'],
			},
		],
	},
	{
		parameter: 'publishers',
		applyType: 'single',
		actions: [
			{ type: 'in', label: t('SHOW_ONLY_IN_SELECTED'), minSelected: 1 },
			{ type: 'nin', label: t('DONT_SHOW_IN_SELECTED'), minSelected: 1 },
			{ type: 'allin', label: t('SHOW_EVERYWHERE'), value: 'ALL' },
		],
	},
	{
		parameter: 'advanced',
		applyType: 'multiple-checkbox',
		actions: [
			{
				value: 'includeIncentivized',
				label: t('INCLUDE_INCENTIVIZED_TRAFFIC', {
					args: [
						<ExternalAnchor
							href={
								'https://help.adex.network/hc/en-us/articles/360014543380-What-is-incentivized-traffic-'
							}
						>
							{t('LEARN_MORE')}
						</ExternalAnchor>,
					],
				}),
			},
			{
				value: 'disableFrequencyCapping',
				label: t('DISABLE_FREQUENCY_CAPPING', {
					args: [
						<ExternalAnchor
							href={
								'https://help.adex.network/hc/en-us/articles/360014597299-What-is-frequency-capping-'
							}
						>
							{t('LEARN_MORE')}
						</ExternalAnchor>,
					],
				}),
			},
			{
				value: 'limitDailyAverageSpending',
				label: t('LIMIT_AVERAGE_DAILY_SPENDING', {
					args: [
						<ExternalAnchor
							href={
								'https://help.adex.network/hc/en-us/articles/360014597319-How-to-limit-your-average-daily-spend'
							}
						>
							{t('LEARN_MORE')}
						</ExternalAnchor>,
					],
				}),
			},
		],
	},
]

const selectAutocompleteAudienceSources = createSelector(
	[
		autocompleteLocationsSingleSelect,
		autocompleteCategoriesMultiSelectIn,
		autocompleteCategoriesMultiSelectNin,
		autocompletePublishersMultiSelectIn,
		autocompletePublishersMultiSelectNin,
	],
	(locations, catIn, catNin, pubIn, pubNin) => ({
		location: {
			singleValuesSrc: locations,
		},
		categories: {
			multipleValuesSrc: {
				in: catIn,
				nin: catNin,
			},
		},
		publishers: {
			multipleValuesSrc: {
				in: pubIn,
				nin: pubNin,
			},
		},
	})
)

export const selectAudienceInputItemOptions = createSelector(
	[selectNewItemByTypeAndId],
	item => {
		return item && item.adUnits ? item.adUnits.map(u => u.type) : null
	}
)

export const websitesAutocompleteSrc = createSelector(
	selectWebsitesArray,
	websites =>
		websites.map(ws => {
			const website = `https://${ws.id}`
			return {
				label: website,
				value: website,
				status: ws.issues && ws.issues.length ? 'error' : 'success',
			}
		})
)

const getDisabledValues = (data, source, inputs, allSrcs) => {
	const disabled = []

	if (
		data.parameter === 'publishers' &&
		inputs.categories &&
		inputs.categories.apply &&
		inputs.categories.apply.includes('in') &&
		inputs.categories.in &&
		inputs.categories.in.length
	) {
		disabled.in = inputs.categories.in.includes('ALL')
			? []
			: source
					.filter(
						x =>
							!x.extraData.categories.some(c =>
								inputs.categories.in.includes(c)
							)
					)
					.map(c => c.value)
	} else if (
		data.parameter === 'categories' &&
		inputs.publishers &&
		inputs.publishers.apply &&
		inputs.publishers.apply === 'in' &&
		inputs.publishers.in &&
		inputs.publishers.in.length
	) {
		const selectedPublishersCategories = new Set()
		allSrcs
			.find(s => s.parameter === 'publishers')
			.source.in.forEach(p => {
				if (inputs.publishers.in.includes(p.value)) {
					p.extraData.categories.forEach(c =>
						selectedPublishersCategories.add(c)
					)
				}
			})

		disabled.in = source
			.filter(
				c => c.value !== 'ALL' && !selectedPublishersCategories.has(c.value)
			)
			.map(c => c.value)
	}

	return disabled
}

export const selectAudienceSourcesWithOptions = createSelector(
	[audienceSources, selectAutocompleteAudienceSources],
	(sources, sourcesData) =>
		sources.map(s => {
			const source = (sourcesData[s.parameter] || {}).multipleValuesSrc
				? sourcesData[s.parameter].multipleValuesSrc
				: {}

			if ((sourcesData[s.parameter] || {}).singleValuesSrc) {
				s.actions.forEach(a => {
					source[a.type] = a.value || sourcesData[s.parameter].singleValuesSrc
				})
			}
			return {
				...s,
				source,
			}
		})
)

export const selectAudienceValidations = createSelector(
	selectWebsitesArray,
	websites =>
		websites.map(ws => {
			const website = `https://${ws.id}`
			return {
				label: website,
				value: website,
				status: ws.issues && ws.issues.length ? 'error' : 'success',
			}
		})
)

export const selectAudienceInputsDataByItem = createSelector(
	[
		selectAudienceSourcesWithOptions,
		selectNewItemByTypeAndId,
		// (state, itemType, itemId, validateId) => ({
		// 	state,
		// 	validateId,
		// }),
	],
	(allSrcsWithOptions, selectedItem) => {
		const isCampaignAudienceItem = !!selectedItem.audienceInput

		// const validations = selectValidationsById(state, validateId) || {}

		// const errors =
		// 	validations[isCampaignAudienceItem ? 'audienceInput' : 'inputs'] || {}

		// const errorParameters = errors.dirty ? errors.errFields || {} : {}

		// console.log('allSrcsWithOptions', allSrcsWithOptions)

		const inputs =
			(isCampaignAudienceItem
				? selectedItem.audienceInput.inputs
				: selectedItem.inputs) || {}

		const SOURCES = allSrcsWithOptions.map(s => {
			const disabledValues = getDisabledValues(
				s,
				//TODO: temp only used for in, so there is no point making it to work with other action types
				s.source.in,
				inputs,
				allSrcsWithOptions
			)

			const source = { ...s.source }
			if (
				!!source.in &&
				source.in.length &&
				!!disabledValues.in &&
				disabledValues.in.length
			) {
				source.in = [...source.in].sort((a, b) => {
					if (
						disabledValues.in.includes(a.value) &&
						!disabledValues.in.includes(b.value)
					) {
						return 1
					} else if (
						!disabledValues.in.includes(a.value) &&
						disabledValues.in.includes(b.value)
					) {
						return -1
					}

					return 0
				})
			}
			return {
				...s,
				source,
				disabledValues,
			}
		})

		const audienceInputData = { SOURCES, inputs, errorParameters: {} }

		return audienceInputData
	}
)

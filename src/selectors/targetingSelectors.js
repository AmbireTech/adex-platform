import React from 'react'
import { createCachedSelector } from 're-reselect'
import { createSelector } from 'reselect'
import { selectNewItemByTypeAndId, selectValidations } from 'selectors'
import { ExternalAnchor } from 'components/common/anchor/anchor'
import { constants, IabCategories } from 'adex-models'
import { t } from './translationsSelectors'

const { CountryTiers, AllCountries, OsGroups } = constants

export const selectTargeting = state => state.persist.targeting

const MIN_SLOTS_FOR_AD_TYPE = 2
const GLOBAL_MIN_CPM_MULTIPLIER = 0.7

export const selectTargetingAnalytics = createSelector(
	[selectTargeting],
	({ targetingData = [] }) => targetingData
)

export const selectTargetingAnalyticsMinByCategories = createSelector(
	[selectTargeting],
	({ minByCategory = {} }) => minByCategory
)

export const selectTargetingAnalyticsCountryTiersCoefficients = createSelector(
	[selectTargeting],
	({ countryTiersCoefficients = {} }) => countryTiersCoefficients
)

export const selectMinTargetingCpm = createSelector(
	[
		selectTargetingAnalyticsMinByCategories,
		selectTargetingAnalyticsCountryTiersCoefficients,
	],
	(minByCategory, coefficients) => {
		const minCat = Object.values(minByCategory).sort((a, b) => a - b)[0] || 0
		const minCof = Object.values(coefficients).sort((a, b) => a - b)[0] || 0
		const minCPM = minCat * minCof * GLOBAL_MIN_CPM_MULTIPLIER

		return minCPM
	}
)

export const selectVerifiedActiveTargetingAnalytics = createSelector(
	[selectTargetingAnalytics],
	targetingAnalytics => {
		const bySlotCount = targetingAnalytics.reduce((byType, x) => {
			x.types.forEach(t => {
				byType[t] = (byType[t] || 0) + 1
			})

			return byType
		}, {})

		return targetingAnalytics
			.filter(
				x =>
					!!x.categories &&
					x.categories.length &&
					x.types &&
					x.types.length &&
					!!x.campaignsEarnedFrom
			)
			.map(t => ({
				...t,
				types: t.types.filter(x => bySlotCount[x] >= MIN_SLOTS_FOR_AD_TYPE),
			}))
			.filter(x => x.types.length)
	}
)

export const selectTargetingAnalyticsCurrentlyUsedTypes = createSelector(
	[selectNewItemByTypeAndId],
	item => {
		return item && item.adUnits ? item.adUnits.map(u => u.type) : null
	}
)

export const selectTargetingAnalyticsByType = createSelector(
	[
		selectVerifiedActiveTargetingAnalytics,
		selectTargetingAnalyticsCurrentlyUsedTypes,
	],
	(targetingAnalytics, types) => {
		const filterByType = types && types.length

		return targetingAnalytics.filter(
			x =>
				!filterByType || (filterByType && types.some(t => x.types.includes(t)))
		)
	}
)

export const selectTargetingCategoriesByType = createSelector(
	[selectTargetingAnalyticsByType],
	targeting =>
		Array.from(
			targeting.reduce((categories, x) => {
				x.categories.forEach(c => categories.add(c))
				return categories
			}, new Set())
		)
)

const mapTargetingDataToPublishers = targetingData =>
	Array.from(
		targetingData
			.reduce(
				(
					publishers,
					{ owner, hostname, alexaRank, categories, reachPerMillion }
				) => {
					publishers.set(hostname, {
						owner,
						hostname,
						alexaRank,
						categories,
						reachPerMillion,
					})
					return publishers
				},
				new Map()
			)
			.values()
	)

export const selectTargetingPublishersByType = createSelector(
	[selectTargetingAnalyticsByType],
	targeting => {
		return mapTargetingDataToPublishers(targeting).sort((a, b) => {
			if (a.alexaRank && !b.alexaRank) {
				return -1
			} else if (a.alexaRank && b.alexaRank) {
				return a.alexaRank - b.alexaRank
			} else if (!a.alexaRank && b.alexaRank) {
				return 1
			} else {
				return 1
			}
		})
	}
)

export const selectTargetingCategories = createSelector(
	[selectTargetingAnalytics],
	targeting =>
		Array.from(
			targeting.reduce((categories, x) => {
				x.categories.forEach(c => categories.add(c))
				return categories
			}, new Set())
		)
)

// It is used for exclusion so they are not filtered and are sorted from worst to best
export const selectAllTargetingPublishers = createSelector(
	[selectTargetingAnalytics],
	targeting => {
		return mapTargetingDataToPublishers(targeting).sort((a, b) => {
			if (a.alexaRank && !b.alexaRank) {
				return 1
			} else if (a.alexaRank && b.alexaRank) {
				return a.alexaRank - b.alexaRank
			} else if (!a.alexaRank && b.alexaRank) {
				return -1
			} else {
				return -1
			}
		})
	}
)

// NOTE: it can be constant but we may need some dynamic data
const autocompleteLocationsSingleSelect = createSelector(
	[],
	() => {
		const tiers = Object.values(CountryTiers).map(
			({ name, ruleValue, countries } = {}) => ({
				label: t(name),
				extraLabel: countries.join(', '),
				value: ruleValue,
				group: t('BY_TIER'),
			})
		)
		const all = AllCountries.map(({ name, ruleValue } = {}) => ({
			label: t(name),
			value: ruleValue,
			group: name[0].toUpperCase(),
		}))

		return [...tiers, ...all]
	}
)

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
	`${t('REACH_PER_MILLION')}: ${publisher.reachPerMillion || '-'}`,
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

export const audienceSources = [
	{
		parameter: 'location',
		applyType: 'single',
		actions: [
			{ type: 'in', label: t('TARGET_COUNTRIES'), minSelected: 1 },
			{ type: 'nin', label: t('EXCLUDED_COUNTRIES'), minSelected: 1 },
			{ type: 'allin', label: t('SHOW_EVERYWHERE'), value: 'ALL' },
		],
		extraInfo: t('LOCATION_TIERS_INFO', {
			args: [
				<ExternalAnchor
					href={'https://help.adex.network/hc/en-us/articles/360014629020'}
				>
					{t('HERE')}
				</ExternalAnchor>,
			],
		}),
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
		parameter: 'devices',
		applyType: 'single',
		actions: [
			{ type: 'allin', label: t('SHOW_EVERYWHERE'), value: 'ALL' },
			{ type: 'in', label: t('SHOW_ONLY_IN_SELECTED'), minSelected: 1 },
			{ type: 'nin', label: t('DONT_SHOW_IN_SELECTED'), minSelected: 1 },
		],
	},
	{
		parameter: 'advanced',
		applyType: 'multiple-checkbox',
		actions: [
			{
				value: 'includeIncentivized',
				label: t('INCLUDE_INCENTIVIZED_TRAFFIC'),
				helper: (
					<ExternalAnchor
						href={
							'https://help.adex.network/hc/en-us/articles/360014543380-What-is-incentivized-traffic-'
						}
					>
						{t('LEARN_MORE')}
					</ExternalAnchor>
				),
			},
			{
				value: 'disableFrequencyCapping',
				label: t('DISABLE_FREQUENCY_CAPPING'),
				helper: (
					<ExternalAnchor
						href={
							'https://help.adex.network/hc/en-us/articles/360014597299-What-is-frequency-capping-'
						}
					>
						{t('LEARN_MORE')}
					</ExternalAnchor>
				),
			},
			{
				value: 'limitDailyAverageSpending',
				label: t('LIMIT_AVERAGE_DAILY_SPENDING'),
				helper: (
					<ExternalAnchor
						href={
							'https://help.adex.network/hc/en-us/articles/360014597319-How-to-limit-your-average-daily-spend'
						}
					>
						{t('LEARN_MORE')}
					</ExternalAnchor>
				),
			},
		],
	},
]

const devices = Object.values(OsGroups).map(
	({ name, ruleValue, oss } = {}) => ({
		label: t(name),
		extraLabel: oss.join(', '),
		value: ruleValue,
		group: t('POPULAR'),
	})
)

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
		devices: {
			singleValuesSrc: devices,
		},
	})
)

export const selectAudienceInputItemOptions = createSelector(
	[selectNewItemByTypeAndId],
	item => {
		return item && item.adUnits ? item.adUnits.map(u => u.type) : null
	}
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
	[selectAutocompleteAudienceSources],
	sourcesData =>
		audienceSources.map(s => {
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

export const selectAudienceValidations = createCachedSelector(
	selectValidations,
	(_, __, ___, validateId) => validateId,
	(validations, id) => validations[id]
)((_, __, ___, validateId) => validateId)

export const selectAudienceInputsDataByItem = createCachedSelector(
	selectAudienceSourcesWithOptions,
	selectNewItemByTypeAndId,
	selectAudienceValidations,
	(_, __, ___, ____, advancedOnly) => advancedOnly,

	(allSrcsWithOptions, selectedItem, validations = {}, advancedOnly) => {
		const isCampaignAudienceItem = selectedItem && !!selectedItem.audienceInput

		const errors =
			validations[isCampaignAudienceItem ? 'audienceInput' : 'inputs'] || {}

		const errorParameters = errors.dirty ? errors.errFields || {} : {}

		const inputs =
			(isCampaignAudienceItem
				? selectedItem.audienceInput.inputs
				: selectedItem.inputs) || {}

		const SOURCES = allSrcsWithOptions
			.filter(s =>
				!!advancedOnly ? s.parameter === 'advanced' : s.parameter !== 'advanced'
			)
			.map(s => {
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

		const audienceInputData = { SOURCES, inputs, errorParameters }

		return audienceInputData
	}
)((_, __, ___, ____, advancedOnly) => advancedOnly)

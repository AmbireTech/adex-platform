import { bigNumberify } from 'ethers/utils'
import { t, selectDemandAnalytics, selectMainToken } from 'selectors'
import { createSelector } from 'reselect'
import { constants } from 'adex-models'
import { WHERE_YOU_KNOW_US } from 'constants/misc'
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
	return constants.AllCountries.map(({ name, value } = {}) => ({
		label: t(name),
		value: value,
	}))
}

const autocompleteGendersSingleSelect = () => {
	return constants.Genders.map(gender => ({
		label: t(gender.split('_')[1].toUpperCase()),
		value: gender,
	}))
}

const autocompleteGoogleVisionSingleSelect = () => {
	return constants.GoogleVisionCategories.map(({ _id }) => ({
		label: t(_id),
		value: _id,
	}))
}

const autocompleteTagsSingleSelect = () => {
	return constants.PredefinedTags.map(({ _id }) => ({
		label: t(_id),
		value: _id,
	}))
}

export const slotSources = () => ({
	tags: { src: autocompleteTagsSingleSelect(), collection: 'tags' },
	categories: {
		src: autocompleteGoogleVisionSingleSelect(),
		collection: 'targeting',
	},
	custom: { src: [], collection: 'tags' },
})

export const unitSources = () => ({
	locations: {
		src: autocompleteLocationsSingleSelect(),
		collection: 'targeting',
	},
	categories: {
		src: autocompleteGoogleVisionSingleSelect(),
		collection: 'targeting',
	},
	genders: { src: autocompleteGendersSingleSelect(), collection: 'targeting' },
	tags: { src: autocompleteTagsSingleSelect(), collection: 'targeting' },
	custom: { src: [], collection: 'targeting' },
})

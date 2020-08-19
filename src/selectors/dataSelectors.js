import { BigNumber, utils } from 'ethers'
import {
	t,
	selectDemandAnalytics,
	selectMainToken,
	selectWebsitesArray,
	selectVerifiedActiveTargetingAnalytics,
} from 'selectors'
import { createSelector } from 'reselect'
import { constants } from 'adex-models'
import { WHERE_YOU_KNOW_US, USER_SIDES } from 'constants/misc'
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
				const dA = BigNumber.from(a.demand ? a.demand.raw.avgCPM : 0)
				const dB = BigNumber.from(b.demand ? b.demand.raw.avgCPM : 0)

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
				(total, r = {}) => total.add(BigNumber.from(r.revenue || '0')),
				BigNumber.from('0')
			)

			verified.set(key, {
				revenue: parseFloat(
					utils.formatUnits(totalRevenue.toString(), decimals)
				),
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

			revenue: (verifiedTypes.get(type) || {}).revenue || 0,
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

export const selectUserSides = createSelector(
	() => selectFromSource(USER_SIDES),
	source => source
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

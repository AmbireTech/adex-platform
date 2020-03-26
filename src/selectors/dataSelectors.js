import { bigNumberify } from 'ethers/utils'
import { t, selectDemandAnalytics, selectMainToken } from 'selectors'
import { createSelector } from 'reselect'
import { constants } from 'adex-models'
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
			var m = moment(startDate);
			m.diff(
				moment(endDate)
					.subtract(1, 'month')
					.endOf('month')
			) <= 0;
			m.add(1, 'month')
		) {
			months.push(+m)
		}
		return months
	}
)

export const selectReceiptMonths = createSelector(
	[selectMonthsRange],
	months =>
		months.map(monthTimestamp => ({
			value: monthTimestamp,
			label: moment(monthTimestamp).format('MMMM, YYYY'),
		}))
)

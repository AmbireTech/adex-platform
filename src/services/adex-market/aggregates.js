import { bigNumberify } from 'ethers/utils'
import { selectRoutineWithdrawTokens, selectMainToken } from 'selectors'
import { tokenInMainTokenValue } from 'services/smart-contracts/actions/stats'
import { formatTokenAmount } from 'helpers/formatters'

import { getCampaigns } from './actions'

export async function getUnitsStatsByType() {
	const { decimals } = selectMainToken()
	const withdrawTokens = selectRoutineWithdrawTokens()
	const allChannels = await getCampaigns()

	const channels = allChannels.filter(
		channel => !!withdrawTokens[channel.depositAsset]
	)

	const unitsByType = channels.reduce((units, channel) => {
		const byType = { ...units }
		channel.spec.adUnits.forEach(unit => {
			byType[unit.type] = byType[unit.type] || []
			byType[unit.type].push(channel)
		})

		return byType
	}, {})

	const unitsByTypeStats = Object.keys(unitsByType).reduce(
		async (prevStats, key) => {
			const stats = await prevStats
			const channelsByType = unitsByType[key]

			let totalPerImpression = bigNumberify('0')
			let totalVolume = bigNumberify('0')

			for (let index = 0; index < channelsByType.length; index++) {
				const channel = channelsByType[index]

				const minPerImpression = await tokenInMainTokenValue({
					token: withdrawTokens[channel.depositAsset],
					balance: bigNumberify(channel.spec.minPerImpression),
				})
				const depositAmount = await tokenInMainTokenValue({
					token: withdrawTokens[channel.depositAsset],
					balance: bigNumberify(channel.depositAmount),
				})

				totalPerImpression = totalPerImpression.add(minPerImpression)
				totalVolume = totalVolume.add(depositAmount)
			}

			const avgPerImpression = totalPerImpression.div(
				bigNumberify(channelsByType.length)
			)
			const avgCPM = avgPerImpression.mul(bigNumberify('1000'))

			const statsByType = { ...stats }
			statsByType[key] = {}
			statsByType[key].raw = {
				totalVolume,
				avgPerImpression,
				avgCPM,
			}

			statsByType[key].formatted = {
				totalVolume: formatTokenAmount(totalVolume, decimals, false, 2),
				avgPerImpression: formatTokenAmount(
					avgPerImpression,
					decimals,
					false,
					2
				),
				avgCPM: formatTokenAmount(avgCPM, decimals, false, 4),
			}

			return statsByType
		},
		Promise.resolve({})
	)

	return unitsByTypeStats
}

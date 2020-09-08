import { BigNumber } from 'ethers'
import { selectRoutineWithdrawTokens, selectMainToken } from 'selectors'
import { tokenInMainTokenValue } from 'services/smart-contracts/actions/stats'
import { formatTokenAmount } from 'helpers/formatters'

import { getCampaigns } from './actions'

export async function getUnitsStatsByType() {
	const { decimals } = selectMainToken()
	const withdrawTokens = selectRoutineWithdrawTokens()
	const allChannels = await getCampaigns({ all: true })

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

			let totalPerImpression = BigNumber.from('0')
			let totalVolume = BigNumber.from('0')

			for (let index = 0; index < channelsByType.length; index++) {
				const channel = channelsByType[index]

				const minPerImpression = await tokenInMainTokenValue({
					token: withdrawTokens[channel.depositAsset],
					balance: BigNumber.from(channel.spec.minPerImpression),
				})
				const depositAmount = await tokenInMainTokenValue({
					token: withdrawTokens[channel.depositAsset],
					balance: BigNumber.from(channel.depositAmount),
				})

				totalPerImpression = totalPerImpression.add(minPerImpression)
				totalVolume = totalVolume.add(depositAmount)
			}

			const avgPerImpression = totalPerImpression.div(
				BigNumber.from(channelsByType.length)
			)
			const avgCPM = avgPerImpression.mul(BigNumber.from('1000'))

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

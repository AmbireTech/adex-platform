import {
	bigNumberify,
	formatUnits
} from 'ethers/utils'

import { getAllCampaigns } from './actions'

const DAI_ADDRESS = process.env.DAI_TOKEN_ADDR

export async function getUnitsStatsByType() {
	const allChannels = await getAllCampaigns()

	const channels = allChannels.filter(channel => channel.depositAsset === DAI_ADDRESS)

	const unitsByType = channels
		.reduce((units, channel) => {
			const byType = { ...units }
			channel.spec.adUnits.forEach(unit => {
				byType[unit.type] = byType[unit.type] || []
				byType[unit.type].push(channel)
			})

			return byType
		}, {})

	const unitsByTypeStats = Object.keys(unitsByType)
		.reduce((stats, key) => {
			const channelsByType = unitsByType[key]

			let totalPerImpression = bigNumberify('0')
			let totalVolume = bigNumberify('0')

			channelsByType.forEach(channel => {

				const minPerImpression = bigNumberify(channel.spec.maxPerImpression)
				const depositAmount = bigNumberify(channel.depositAmount)

				totalPerImpression = totalPerImpression.add(minPerImpression)
				totalVolume = totalVolume.add(depositAmount)
			})

			const avgPerImpression = totalPerImpression.div(bigNumberify(channelsByType.length))
			const avgCPM = avgPerImpression.mul(bigNumberify('1000'))

			const statsByType = { ...stats }
			statsByType[key] = {}
			statsByType[key].raw = {
				totalVolume,
				avgPerImpression,
				avgCPM
			}

			statsByType[key].formatted = {
				totalVolume: formatUnits(totalVolume, 18),
				avgPerImpression: formatUnits(avgPerImpression, 18),
				avgCPM: formatUnits(avgCPM, 18)
			}

			return statsByType

		}, {})

	return unitsByTypeStats
}
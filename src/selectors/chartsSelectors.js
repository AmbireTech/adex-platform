import { t, selectCampaignAnalyticsByChannelStats } from 'selectors'
import { createCachedSelector } from 're-reselect'

export const selectCampaignDoughnutStats = createCachedSelector(
	(state, { campaignId, chartColors, maxDataSets } = {}) => {
		const analytics = {
			impressions: selectCampaignAnalyticsByChannelStats(
				state,
				'IMPRESSION',
				campaignId
			),
			clicks: selectCampaignAnalyticsByChannelStats(state, 'CLICK', campaignId),
		}

		return { ...analytics, chartColors, maxDataSets }
	},
	({ impressions, clicks, chartColors, maxDataSets }) => {
		const imprStats = impressions.reportChannelToHostname || {}
		const clickStats = clicks.reportChannelToHostname || {}

		const { labels, impressionsData, clicksData } = Object.keys(imprStats)
			.sort((a, b) => imprStats[b] - imprStats[a])
			.reduce(
				(data, key, i) => {
					const newData = { ...data }
					if (i < maxDataSets) {
						newData.labels.push(key)
						newData.impressionsData.push(imprStats[key] || 0)
						data.clicksData.push(clickStats[key] || 0)
					} else {
						data.labels[maxDataSets] = t('PIE_CHART_OTHER')

						data.impressionsData[maxDataSets] =
							(data.impressionsData[maxDataSets] || 0) + (imprStats[key] || 0)

						data.clicksData[maxDataSets] =
							(data.clicksData[maxDataSets] || 0) + (clickStats[key] || 0)
					}

					return newData
				},
				{ labels: [], impressionsData: [], clicksData: [] }
			)

		const data = {
			labels,
			datasets: [
				{
					backgroundColor: chartColors,
					hoverBackgroundColor: chartColors,
					borderWidth: 0,
					data: impressionsData,
					label: t('CHART_LABEL_IMPRESSIONS'),
				},
				{
					backgroundColor: chartColors,
					hoverBackgroundColor: chartColors,
					borderWidth: 0,
					data: clicksData,
					label: t('CHART_LABEL_CLICKS'),
				},
			],
		}

		return data
	}
)((_state, { campaignId = '-' } = {}) => campaignId)

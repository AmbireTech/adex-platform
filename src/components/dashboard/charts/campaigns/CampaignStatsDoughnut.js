import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { t } from 'selectors'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'
import PropTypes from 'prop-types'

function CampaignStatsDoughnut(props) {
	const { campaingAnalytics, campaignId } = props
	const maxDataSets = props.maxDataSets || CHARTS_COLORS.length
	const getPieChartData = () => {
		const results = {
			labels: [],
			datasets: [
				{
					backgroundColor: CHARTS_COLORS,
					hoverBackgroundColor: CHARTS_COLORS,
					borderWidth: 0,
					data: [],
					label: t('CHART_LABEL_IMPRESSIONS'),
				},
				{
					backgroundColor: CHARTS_COLORS,
					hoverBackgroundColor: CHARTS_COLORS,
					borderWidth: 0,
					data: [],
					label: t('CHART_LABEL_CLICKS'),
				},
			],
		}
		const campaign = type => campaingAnalytics[type].byChannelStats[campaignId]
		const imprStats = campaign('IMPRESSION').reportChannelToHostname
		const clickStats = campaign('CLICK').reportChannelToHostname
		Object.keys(imprStats)
			.sort((a, b) => imprStats[b] - imprStats[a])
			.map((key, i) => {
				if (i < maxDataSets) {
					results.labels.push(key)
					results.datasets[0].data.push(imprStats[key] || 0)
					results.datasets[1].data.push(clickStats[key] || 0)
				} else {
					results.labels[maxDataSets] = t('PIE_CHART_OTHER')

					results.datasets[0].data[maxDataSets] =
						(results.datasets[0].data[maxDataSets] || 0) + (imprStats[key] || 0)

					results.datasets[1].data[maxDataSets] =
						(results.datasets[1].data[maxDataSets] || 0) +
						(clickStats[key] || 0)
				}
			})
		return results
	}
	const data = getPieChartData()

	return (
		<Doughnut
			width={450}
			height={450}
			data={data}
			options={{
				// responsive: true,
				legend: {
					position: 'bottom',
				},
				title: {
					display: true,
					text: t('CAMPAIGN_STATS_PIE_CHART'),
				},
				animation: {
					animateScale: true,
					animateRotate: true,
				},
				tooltips: {
					callbacks: {
						label: function(item, data) {
							return (
								data.datasets[item.datasetIndex].label +
								': ' +
								data.labels[item.index] +
								': ' +
								data.datasets[item.datasetIndex].data[item.index]
							)
						},
					},
				},
			}}
		/>
	)
}

CampaignStatsDoughnut.propTypes = {
	campaingAnalytics: PropTypes.object.isRequired,
	campaignId: PropTypes.string.isRequired,
}

export default CampaignStatsDoughnut

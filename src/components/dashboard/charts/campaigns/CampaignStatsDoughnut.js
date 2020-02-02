import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { t, selectCampaignDoughnutStats } from 'selectors'
import { useSelector } from 'react-redux'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'
import PropTypes from 'prop-types'

function CampaignStatsDoughnut({
	campaignId,
	maxDataSets = CHARTS_COLORS.length,
	chartColors = CHARTS_COLORS,
}) {
	const data = useSelector(state =>
		selectCampaignDoughnutStats(state, {
			campaignId,
			chartColors,
			maxDataSets,
		})
	)

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
				animation: false,
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
	campaignId: PropTypes.string.isRequired,
}

export default CampaignStatsDoughnut

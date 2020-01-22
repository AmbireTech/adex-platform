import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'

function AdExPieChart(props) {
	const pieData = props.pieData || {}
	// const options = props.options || {}
	// const useStyles = makeStyles(styles)
	// const classes = useStyles()
	// let opts = {
	// 	// responsive: true,
	// 	// responsiveAnimationDuration: 500,
	// 	cutoutPercentage: 70,
	// 	legend: {
	// 		display: false,
	// 	},
	// 	tooltips: {
	// 		callbacks: {
	// 			label: function(tooltipItem, data) {
	// 				let label = (data.labels[tooltipItem.index] || '').split(' [')[0]
	// 				label += ': '
	// 				let count =
	// 					data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
	// 				label += count
	// 				label += ' (' + ((count / pieData.totalCount) * 100).toFixed(2) + '%)'
	// 				return label
	// 			},
	// 		},
	// 	},
	// 	maintainAspectRatio: false,
	// 	...options,
	// }

	let chartData = {
		labels: pieData.labels || [],
		datasets: [
			pieData.data.map(item => ({
				backgroundColor: CHARTS_COLORS,
				hoverBackgroundColor: CHARTS_COLORS,
				borderWidth: 0,
				data: item || [],
			})),
		],
	}
	return (
		// <div className={classes.chartParent}>
		// 	<h3 className={classes.chartTitle}>{props.chartTitle}</h3>
		// 	<div className={classes.chartContainer}>
		<Doughnut width={250} height={150} data={chartData} />
		// 	</div>
		// </div>
	)
}

export default AdExPieChart

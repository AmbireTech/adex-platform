import React from 'react'
import { Line } from 'react-chartjs-2'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'
import { formatTokenAmount, formatDateTime } from 'helpers/formatters'

const parseValueByMetric = ({ value, metric }) => {
	switch (metric) {
		case 'eventPayouts':
			return parseFloat(formatTokenAmount(value, 18))
		case 'eventCounts':
			return parseInt(value, 10)
		default:
			return value
	}
}

export const SimpleStatistics = ({
	data = [],
	options = {},
	t,
	metric,
	xLabel,
	yLabel,
}) => {
	const { labels, datasets } = data.reduce(
		(memo, item) => {
			const { time, value } = item
			memo.labels.push(formatDateTime(time))
			memo.datasets.push(parseValueByMetric({ value, metric }))

			return memo
		},
		{
			labels: [],
			datasets: [],
		}
	)

	let commonDsProps = {
		fill: true,
		lineTension: 0.3,
		borderWidth: 0,
		pointRadius: 1,
		pointHitRadius: 10,
		backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[1], 0.7),
		borderColor: Helper.hexToRgbaColorString(CHARTS_COLORS[1], 1),
	}

	let chartData = {
		labels: labels,
		datasets: [{ ...commonDsProps, data: datasets }],
	}

	const linesOptions = {
		responsive: true,
		title: {
			display: true,
			text: options.title,
		},
		tooltips: {
			mode: 'index',
		},
		scales: {
			xAxes: [
				{
					display: true,
					gridLines: {
						display: true,
						// beginAtZero: true,
					},
					// labels: {
					//     show: true
					// }
					scaleLabel: {
						display: true,
						labelString: t(xLabel || 'TIMEFRAME'),
					},
				},
			],
			yAxes: [
				{
					gridLines: {
						display: true,
						beginAtZero: true,
					},
					scaleLabel: {
						display: true,
						labelString: t(yLabel || 'PAYOUTS'),
					},
				},
			],
		},
	}

	return <Line data={chartData} options={linesOptions} />
}

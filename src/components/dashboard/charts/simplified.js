import React, { useEffect } from 'react'
import { Line, Chart } from 'react-chartjs-2'
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
	timeframe = '',
	options = {},
	t,
	// metric = '',
	xLabel,
	yLabel,
	eventType = '',
}) => {
	// Vertical line / crosshair
	useEffect(() => {
		Chart.pluginService.register({
			afterDraw: function(chart) {
				if (chart.tooltip._active && chart.tooltip._active.length) {
					const activePoint = chart.controller.tooltip._active[0]
					const ctx = chart.ctx
					const x = activePoint.tooltipPosition().x
					const topY = chart.scales['y-axis-1'].top
					const bottomY = chart.scales['y-axis-1'].bottom
					ctx.save()
					ctx.beginPath()
					ctx.moveTo(x, topY)
					ctx.lineTo(x, bottomY)
					ctx.lineWidth = 1 // line width
					ctx.setLineDash([1, 5])
					ctx.strokeStyle = '#C0C0C0' // color of the vertical line
					ctx.stroke()
					ctx.restore()
				}
			},
		})
	})

	const parseData = metric => {
		const aggr = data[metric][timeframe].aggr || []
		return aggr.reduce(
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
	}

	let commonDsProps = {
		fill: false,
		lineTension: 0.3,
		borderWidth: 0,
		pointRadius: 3,
		pointHitRadius: 10,
		backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[1], 0.5),
		borderColor: Helper.hexToRgbaColorString(CHARTS_COLORS[1], 1),
	}

	let chartData = {
		labels: parseData('eventPayouts').labels,
		datasets: [
			{
				...commonDsProps,
				backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[1], 0.5),
				borderColor: Helper.hexToRgbaColorString(CHARTS_COLORS[1], 1),
				label: 'DAI', //t('TOTAL_EVENTPAYOUTS_IMPRESSION'),
				data: parseData('eventPayouts').datasets,
				yAxisID: 'y-axis-1',
			},
			{
				...commonDsProps,
				backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[2], 0.5),
				borderColor: Helper.hexToRgbaColorString(CHARTS_COLORS[2], 1),
				label: 'Impressions', //t('TOTAL_EVENTCOUNTS_IMPRESSION'),
				data: parseData('eventCounts').datasets,
				yAxisID: 'y-axis-2',
			},
		],
	}

	const linesOptions = {
		responsive: true,
		maintainAspectRatio: false,
		// legend: {
		// 	display: false,
		// },
		title: {
			display: true,
			text: options.title,
		},
		tooltips: {
			backgroundColor: 'black',
			mode: 'index',
			intersect: false,
		},
		hover: {
			mode: 'index',
			intersect: false,
		},
		scales: {
			xAxes: [
				{
					display: true,
					gridLines: {
						display: false,
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
					},
					ticks: {
						beginAtZero: true,
					},
					scaleLabel: {
						display: true,
						labelString: t(yLabel || 'PAYOUTS'),
					},
					id: 'y-axis-1',
				},
				{
					type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
					display: true,
					position: 'right',
					id: 'y-axis-2',
					labelString: t('LABEL_IMPRESSIONS'),
					ticks: {
						precision: 0,
					},
					// grid line settings
					gridLines: {
						drawOnChartArea: false, // only want the grid lines for one axis to show up
					},
				},
			],
		},
	}

	return <Line height={500} data={chartData} options={linesOptions} />
}

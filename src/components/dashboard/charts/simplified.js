import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Line, Chart } from 'react-chartjs-2'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'
import { selectMainToken, selectAnalyticsTimeframe } from 'selectors'
import { formatFloatNumberWithCommas } from 'helpers/formatters'
import * as ChartAnnotation from 'chartjs-plugin-annotation'
import dateUtils from 'helpers/dateUtils'
import { formatAbbrNum } from 'helpers/formatters'

const commonDsProps = {
	fill: false,
	lineTension: 0.1,
	borderWidth: 0,
	pointRadius: 3,
	pointHitRadius: 10,
}

export const SimpleStatistics = ({
	payouts,
	impressions,
	clicks,
	cpm,
	options = {},
	t,
	xLabel = 'TIMEFRAME',
	y1Label = 'DATA1',
	y2Label = 'DATA2',
	y3Label = 'DATA3',
	y4Label = 'DATA4',
	y1Color = CHARTS_COLORS[1],
	y2Color = CHARTS_COLORS[2],
	y3Color = CHARTS_COLORS[3],
	y4Color = CHARTS_COLORS[4],
}) => {
	const { symbol } = useSelector(selectMainToken)
	const timeframe = useSelector(selectAnalyticsTimeframe)
	// Vertical line / crosshair
	useEffect(() => {
		Chart.pluginService.register({
			afterDraw: function(chart) {
				const ctx = chart.ctx
				if (chart.tooltip._active && chart.tooltip._active.length) {
					const activePoint = chart.controller.tooltip._active[0]
					const x = activePoint.tooltipPosition().x
					const chartScalesy1 = chart.scales['y-axis-1']
					if (chartScalesy1) {
						const topY = chartScalesy1.top
						const bottomY = chartScalesy1.bottom
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
				}
			},
		})
	})

	const getNearestSixHoursUTC = hoursToRound => {
		const now = dateUtils.date()
		const hoursMulti = Math.floor(dateUtils.getHours(now) / hoursToRound)
		const nearestSix = dateUtils.setHours(
			now,
			hoursMulti * hoursToRound + dateUtils.getUTCOffset(now)
		)
		return dateUtils.setMinutes(dateUtils.setSeconds(nearestSix, 0), 0)
	}

	const getLabelByTimeframe = timeframe => {
		switch (timeframe) {
			case 'hour':
				return dateUtils.format(dateUtils.date(), 'YYYY-MM-DD HH:mm')
			case 'day':
				return dateUtils.format(
					dateUtils.setMinutes(dateUtils.date(), 0),
					'YYYY-MM-DD HH:mm'
				)
			case 'week':
				return dateUtils.format(getNearestSixHoursUTC(6), 'YYYY-MM-DD HH:mm')
			default:
				return dateUtils.format(dateUtils.date(), 'YYYY-MM-DD HH:mm')
		}
	}

	const labelFormating = (timeframe, date) => {
		return timeframe === 'week'
			? dateUtils.format(dateUtils.date(date), 'Do MMM, HH:mm')
			: dateUtils.format(dateUtils.date(date), 'HH:mm')
	}

	const chartData = {
		labels: payouts.labels,
		datasets: [
			{
				...commonDsProps,
				backgroundColor: Helper.hexToRgbaColorString(y1Color, 1),
				borderColor: Helper.hexToRgbaColorString(y1Color, 1),
				label: y1Label,
				data: payouts.datasets,
				yAxisID: 'y-axis-1',
			},
			{
				...commonDsProps,
				backgroundColor: Helper.hexToRgbaColorString(y2Color, 1),
				borderColor: Helper.hexToRgbaColorString(y2Color, 1),
				label: y2Label,
				data: impressions.datasets,
				yAxisID: 'y-axis-2',
			},
			{
				...commonDsProps,
				backgroundColor: Helper.hexToRgbaColorString(y3Color, 1),
				borderColor: Helper.hexToRgbaColorString(y3Color, 1),
				label: y3Label,
				data: clicks.datasets,
				yAxisID: 'y-axis-3',
			},
			{
				...commonDsProps,
				backgroundColor: Helper.hexToRgbaColorString(y4Color, 1),
				borderColor: Helper.hexToRgbaColorString(y4Color, 1),
				pointBackgroundColor: y4Color,
				label: y4Label,
				data: cpm.datasets,
				yAxisID: 'y-axis-4',
			},
		],
	}

	const linesOptions = {
		animation: false,
		responsive: true,
		annotation: {
			annotations: [
				{
					type: 'line',
					mode: 'vertical',
					scaleID: 'x-axis-0',
					value: getLabelByTimeframe(timeframe),
					borderColor: 'red',
					borderWidth: 2,
					borderDash: [2, 2],
					label: {
						content: t('NOW'),
						enabled: true,
						position: 'bottom',
						cornerRadius: 0,
					},
				},
			],
		},
		// This and fixed height are used for proper mobile display of the chart
		maintainAspectRatio: false,
		title: {
			display: false,
			text: options.title,
		},
		tooltips: {
			backgroundColor: 'black',
			mode: 'index',
			intersect: false,
			callbacks: {
				label: function(t, d) {
					// This adds currency MainToken (DAI) to y1Label in the tooltips
					var xLabel = d.datasets[t.datasetIndex].label
					var yLabel =
						xLabel === y1Label
							? `${formatFloatNumberWithCommas(t.yLabel)} ${symbol}`
							: formatFloatNumberWithCommas(t.yLabel)
					return `${xLabel}: ${yLabel}`
				},
			},
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
					scaleLabel: {
						display: true,
						labelString: t(xLabel || 'TIMEFRAME'),
					},
					ticks: {
						autoSkip: false,
						maxRotation: 0,
						minRotation: 0,
						callback: function(tick, index, array) {
							return index === 0 || index === array.length - 1 ? tick : ' '
							// return index % Math.floor(array.length / 12) ? '' : tick
						},
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
						labelString: y1Label,
					},
					id: 'y-axis-1',
				},
				{
					type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
					display: true,
					position: 'right',
					scaleLabel: {
						display: true,
						labelString: y2Label,
					},
					id: 'y-axis-2',
					ticks: {
						beginAtZero: true,
						precision: 0,
						callback: function(tick) {
							return formatAbbrNum(tick, 2)
						},
					},
					// grid line settings
					gridLines: {
						drawOnChartArea: false, // only want the grid lines for one axis to show up
					},
				},
				{
					type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
					display: true,
					position: 'right',
					scaleLabel: {
						display: true,
						labelString: y3Label,
					},
					id: 'y-axis-3',
					ticks: {
						beginAtZero: true,
						precision: 0,
						callback: function(tick) {
							return formatAbbrNum(tick, 2)
						},
					},
					// grid line settings
					gridLines: {
						drawOnChartArea: false, // only want the grid lines for one axis to show up
					},
				},
				{
					type: 'linear',
					display: false,
					gridLines: {
						drawOnChartArea: false, // only want the grid lines for one axis to show up
					},
					scaleLabel: {
						display: false,
						labelString: y4Label,
					},
					id: 'y-axis-4',
				},
			],
		},
	}

	return (
		<Line
			height={500}
			data={chartData}
			options={linesOptions}
			plugins={[ChartAnnotation]}
		/>
	)
}

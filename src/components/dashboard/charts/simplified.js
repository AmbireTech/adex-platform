import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Line, Chart } from 'react-chartjs-2'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'
import { GANDALF_GREY, ALEX_GREY_LIGHT } from 'components/App/themeMUi'
import { Box, Typography } from '@material-ui/core'
import Helper from 'helpers/miscHelpers'
import { selectMainToken } from 'selectors'
import { formatFloatNumberWithCommas } from 'helpers/formatters'
import { t } from 'selectors'
import { useWindowSize } from 'hooks/useWindowSize'

const commonDsProps = {
	fill: false,
	lineTension: 0,
	borderWidth: 2,
	pointRadius: 2,
	pointHitRadius: 10,
}

const DEFAULT_FONT_SIZE = 14.2
const FONT = 'Roboto'
const DASH_SIZE = 4
const DASH_WIDTH = 2

const DefaultLabel = ({ label = '', align }) =>
	label.split('-').map((x, index, all) => (
		<Typography key={x + index} component='div' variant='caption' align={align}>
			{x}
		</Typography>
	))

export const SimpleStatistics = ({
	data1,
	data2,
	data3,
	data4,
	data1Active = true,
	data2Active = true,
	data3Active = true,
	data4Active = true,
	dataSynced,
	defaultLabels = [],
	options = {},
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
	const windowSize = useWindowSize()
	const chartHeight = Math.min(
		Math.max(Math.floor((windowSize.height || 0) / 2.2), 240),
		420
	)
	// Vertical line / crosshair
	useEffect(() => {
		Chart.pluginService.register({
			beforeDraw: function(chart) {
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
						ctx.lineWidth = DASH_WIDTH
						ctx.setLineDash([DASH_SIZE, DASH_SIZE])
						ctx.strokeStyle = GANDALF_GREY // color of the vertical line
						ctx.stroke()
						ctx.restore()
					}
				}
			},
		})
	})

	const chartData = {
		labels: dataSynced ? data1.labels : defaultLabels,
		datasets: [
			{
				...commonDsProps,
				backgroundColor: Helper.hexToRgbaColorString(y1Color, 1),
				borderColor: Helper.hexToRgbaColorString(y1Color, 1),
				label: y1Label,
				data: dataSynced ? data1.datasets : [],
				yAxisID: 'y-axis-1',
				hidden: !data1Active,
			},
			{
				...commonDsProps,
				backgroundColor: Helper.hexToRgbaColorString(y2Color, 1),
				borderColor: Helper.hexToRgbaColorString(y2Color, 1),
				label: y2Label,
				data: dataSynced ? data2.datasets : [],
				yAxisID: 'y-axis-2',
				hidden: !data2Active,
			},
			{
				...commonDsProps,
				backgroundColor: Helper.hexToRgbaColorString(y3Color, 1),
				borderColor: Helper.hexToRgbaColorString(y3Color, 1),
				label: y3Label,
				data: dataSynced ? data3.datasets : [],
				yAxisID: 'y-axis-3',
				hidden: !data3Active,
			},
			{
				...commonDsProps,
				backgroundColor: Helper.hexToRgbaColorString(y4Color, 1),
				borderColor: Helper.hexToRgbaColorString(y4Color, 1),
				pointBackgroundColor: y4Color,
				label: y4Label,
				data: dataSynced ? data4.datasets : [],
				yAxisID: 'y-axis-4',
				hidden: !data4Active,
			},
		],
	}

	const linesOptions = {
		animation: false,
		responsive: true,
		layout: {
			padding: {
				top: 16,
			},
		},
		// This and fixed height are used for proper mobile display of the chart
		maintainAspectRatio: false,
		title: {
			display: false,
			text: options.title,
		},
		legend: {
			display: false,
		},
		tooltips: {
			backgroundColor: 'black',
			mode: 'index',
			intersect: false,
			titleFontSize: DEFAULT_FONT_SIZE,
			bodyFontSize: DEFAULT_FONT_SIZE,
			bodyFontFamily: FONT,
			titleFontFamily: FONT,
			xPadding: 8,
			yPadding: 8,
			cornerRadius: 0,
			bodySpacing: 4,
			caretSize: 8,
			displayColors: true,
			callbacks: {
				label: function(t, d) {
					// This adds currency MainToken (DAI) to y3Label in the tooltips
					var xLabel = d.datasets[t.datasetIndex].label
					var yLabel =
						xLabel === y3Label
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
						display: true,
						drawBorder: true,
						drawTicks: true,
						color: ALEX_GREY_LIGHT,
					},
					scaleLabel: {
						display: false,
						labelString: t(xLabel || 'TIMEFRAME'),
						fontSize: DEFAULT_FONT_SIZE,
						fontFamily: FONT,
					},
					ticks: {
						autoSkip: true,
						maxTicksLimit: 2,
						maxRotation: 0,
						padding: -24,
						fontSize: DEFAULT_FONT_SIZE,
						fontFamily: FONT,
						callback: () => '',
					},
				},
			],
			yAxes: [
				{
					// NOTE: this one is just to show constant size grid lines
					display: true,
					color: ALEX_GREY_LIGHT,
					gridLines: {
						display: true,
						drawBorder: false,
						drawTicks: false,
						color: ALEX_GREY_LIGHT,
					},
					ticks: {
						beginAtZero: true,
						maxTicksLimit: 11,
						stepSize: 1,
						min: 0,
						max: 10,
						callback: () => '',
					},
					scaleLabel: {
						display: false,
					},
					type: 'linear',
					id: 'y-axis-dummy-grid-lines',
				},
				{
					display: false,
					ticks: {
						beginAtZero: true,
					},
					type: 'linear',
					id: 'y-axis-1',
				},
				{
					type: 'linear',
					display: false,
					id: 'y-axis-2',
					ticks: {
						beginAtZero: true,
					},
				},
				{
					type: 'linear',
					display: false,
					id: 'y-axis-3',
					ticks: {
						beginAtZero: true,
						// Hax - force to shift the data veridically
						// because chance for overlapping with -1 is very big
						// At same CPM impressions are the same curve as the sped one
						maxTicksLimit: 3,
					},
				},
				{
					type: 'linear',
					display: false,
					id: 'y-axis-4',
					ticks: {
						beginAtZero: true,
					},
				},
			],
		},
	}

	return (
		<Box>
			<Box height={chartHeight}>
				<Line height={chartHeight} data={chartData} options={linesOptions} />
			</Box>
			<Box
				display='flex'
				flexDirection='row'
				justifyContent='space-between'
				alignItems='center'
				px={1}
				flexWrap='wrap'
			>
				<Box flexGrow='1'>
					<DefaultLabel label={defaultLabels[0]} align='left' />
				</Box>

				<Box flexGrow='1'>
					<Typography component='div' variant='caption' align='center'>
						{t(xLabel || 'TIMEFRAME')}
					</Typography>
				</Box>

				<Box flexGrow='1'>
					<DefaultLabel label={defaultLabels[1]} align='right' />
				</Box>
			</Box>
		</Box>
	)
}

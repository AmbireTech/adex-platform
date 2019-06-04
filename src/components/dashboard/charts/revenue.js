import React from 'react'
import { Line } from 'react-chartjs-2'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'

export const PublisherStatistics = ({ data, options = {}, t }) => {

	if (!Object.keys(data).length) return null

	const datasets = Object.keys(data).map(k => {

		return Object.keys(data[k]).reduce((memo, key) => {
			const value = data[k][key]

			memo.labels.push(key)
			memo.value.push(value || 0)

			memo.step.min = Math.min(memo.step.min, value)
			memo.step.max = Math.max(memo.step.max, value)

			return memo

		}, { labels: [], value: [], step: { min: 0, max: 0 } })
	})

	// console.log('datasets', datasets)

	// return null

	let commonDsProps = {
		fill: false,
		lineTension: 0.3,
		borderWidth: 0,
		pointRadius: 1,
		pointHitRadius: 10,
	}

	let chartData = {
		labels: data.labels,
		// stacked: true,
		datasets: datasets.map((set, index) => {
			return {
				...commonDsProps,
				label: index,
				data: set.value,
				backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[index % CHARTS_COLORS.length], 0.6),
				borderColor: Helper.hexToRgbaColorString(CHARTS_COLORS[index % CHARTS_COLORS.length], 0.6),
				// yAxisID: 'y-axis-1'
			}
		})
	}

	const maxTickLimit = 10
	const max = datasets[0].step.max || 1
	const min = datasets[0].step.min || 0
	const step = Math.ceil(max / maxTickLimit) || 1

	let maxTick = (step * maxTickLimit)

	if (max < (maxTickLimit)) {
		maxTick = max
	}

	const linesOptions = {
		responsive: true,
		title: {
			display: true,
			text: options.title
		},
		elements: {
			line: {
				fill: true
			}
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
						// beginAtZero: true
					},
					// labels: {
					//     show: true
					// }
				}
			],
			yAxes: [
				{
					display: true,
					ticks: {
						beginAtZero: true,
						min: min,
						max: maxTick,
						stepSize: step,
						maxTicksLimit: maxTickLimit + 1
					},
					gridLines: {
						display: true,
						beginAtZero: true
					},
				}
			]
		}
	}

	return (
		<Line data={chartData} options={linesOptions} />
	)

}
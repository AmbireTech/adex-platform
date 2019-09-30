import React from 'react'
import { Line } from 'react-chartjs-2'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'
import { formatTokenAmount } from 'helpers/formatters'
import { bigNumberify } from 'ethers/utils'

const getChannelName = channel => {
	if (!channel || !channel.spec) {
		return 'unknown'
	}
	const amount = formatTokenAmount(channel.depositAmount, 18, true)
	const cpm = formatTokenAmount(
		bigNumberify(channel.spec.minPerImpression)
			.mul(1000)
			.toString(),
		18,
		true
	)

	return `Deposit ${amount} DAI for CPM ${cpm} DAI`
}

export const PublisherStatistics = ({ data, channels, options = {}, t }) => {
	// TODO: refine mapping, format values and labels
	if (!Object.keys(data).length) return null
	const dataKeys = Object.keys(data)

	const defaultValues = dataKeys.reduce((defaults, key) => {
		defaults[key] = null
		return defaults
	}, {})

	const labelsWithData = dataKeys.reduce(
		({ labels, sets }, k) => {
			const values = Object.keys(data[k]).reduce(
				(memo, key) => {
					const value = data[k][key]

					labels[key] = labels[key] || { ...defaultValues }
					labels[key][k] = value

					memo.labels.push(key)
					memo.value.push(value || 0)

					memo.step.min = Math.min(memo.step.min, value)
					memo.step.max = Math.max(memo.step.max, value)

					return memo
				},
				{ label: k, labels: [], value: [], step: { min: 0, max: 0 } }
			)

			sets.push(values)

			return {
				labels,
				sets,
			}
		},
		{ labels: {}, sets: [] }
	)

	const labelsKeys = Object.keys(labelsWithData.labels)
	const datasets = labelsKeys.reduce(
		({ sets }, key) => {
			const set = labelsWithData.labels[key]

			dataKeys.forEach((dataKey, index) => {
				sets[index].data.push(set[dataKey])
				sets[index].label = dataKey
			})

			return { sets }
		},
		{
			sets: dataKeys.map(key => {
				return { label: '', data: [] }
			}),
		}
	)

	let commonDsProps = {
		fill: true,
		lineTension: 0.3,
		borderWidth: 0,
		pointRadius: 1,
		pointHitRadius: 10,
	}

	let chartData = {
		labels: labelsKeys,
		stacked: true,
		datasets: datasets.sets.map((set, index) => {
			return {
				...commonDsProps,
				label: getChannelName(channels[set.label]) + ` - ${index}`,
				data: set.data,
				backgroundColor: Helper.hexToRgbaColorString(
					CHARTS_COLORS[index % CHARTS_COLORS.length],
					1
				),
				// borderColor: Helper.hexToRgbaColorString(CHARTS_COLORS[index % CHARTS_COLORS.length], 1),
				// yAxisID: 'y-axis-1'
			}
		}),
	}

	// const maxTickLimit = 10
	// const max = datasets[0].step.max || 1
	// const min = datasets[0].step.min || 0
	// const step = Math.ceil(max / maxTickLimit) || 1

	// let maxTick = (step * maxTickLimit)

	// if (max < (maxTickLimit)) {
	// 	maxTick = max
	// }

	const linesOptions = {
		responsive: true,
		title: {
			display: true,
			text: options.title,
		},
		// elements: {
		// 	line: {
		// 		fill: true
		// 	}
		// },
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
					scaleLabel: {
						display: true,
						labelString: t('TIMEFRAME'),
					},
				},
			],
			yAxes: [
				{
					stacked: true,
					// display: true,
					// ticks: {
					// beginAtZero: true,
					// min: min,
					// max: maxTick,
					// stepSize: step,
					// maxTicksLimit: maxTickLimit + 1
					// },
					gridLines: {
						display: true,
						// beginAtZero: true
					},
					scaleLabel: {
						display: true,
						labelString: t('VIEWS'),
					},
				},
			],
		},
	}

	return <Line data={chartData} options={linesOptions} />
}

export const PublisherSimpleStatistics = ({ data = [], options = {}, t }) => {
	const { labels, datasets } = data.reduce(
		(memo, item) => {
			memo.labels.push(item.time.toString())
			memo.datasets.push(item.value)

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
						// beginAtZero: true
					},
					// labels: {
					//     show: true
					// }
					scaleLabel: {
						display: true,
						labelString: t('TIMEFRAME'),
					},
				},
			],
			yAxes: [
				{
					gridLines: {
						display: true,
						// beginAtZero: true
					},
					scaleLabel: {
						display: true,
						labelString: t('PAYOUTS'),
					},
				},
			],
		},
	}

	return <Line data={chartData} options={linesOptions} />
}

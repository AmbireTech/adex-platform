import React from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { CHARTS_COLORS, hexColorsToRgbaArray } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'

export const BidsTimeStatistics = ({ data, options = {}, t }) => {

    if (!Object.keys(data).length) return null
    data = Object.keys(data).reduce((memo, key) => {
        const item = data[key]

        memo.labels.push(key)
        memo.clicks.push(item.clicks)
        memo.uniqueClicks.push(item.uniqueClicks)
        memo.loaded.push(item.loaded)

        memo.step.min = Math.min(memo.step.min, item.clicks, item.uniqueClicks, item.loaded)
        memo.step.max = Math.max(memo.step.max, item.clicks, item.uniqueClicks, item.loaded)

        return memo

    }, { labels: [], clicks: [], uniqueClicks: [], loaded: [], step: { min: 0, max: 0 } })


    // console.log('data', data)

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
        datasets: [
            {
                ...commonDsProps,
                label: t('CHART_LABEL_UNIQUE_CLICKS'),
                data: data.uniqueClicks,
                backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[2], 0.6),
                borderColor: Helper.hexToRgbaColorString(CHARTS_COLORS[2], 0.6),
                // yAxisID: 'y-axis-1'
            },
            {
                ...commonDsProps,
                label: t('CHART_LABEL_CLICKS'),
                data: data.clicks,
                backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[0], 0.6),
                borderColor: Helper.hexToRgbaColorString(CHARTS_COLORS[0], 0.6),
                // yAxisID: 'y-axis-1'
            },
            {
                ...commonDsProps,
                label: t('CHART_LABEL_IMPRESSIONS'),
                data: data.loaded,
                backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[4], 0.6),
                borderColor: Helper.hexToRgbaColorString(CHARTS_COLORS[4], 0.6),
                // yAxisID: 'y-axis-1'
            }
        ]
    }

    const maxTickLimit = 10
    const max = (Math.ceil(data.step.max / 5) * 5) || 1
    const min = data.step.min || 0
    const step = Math.ceil(max / maxTickLimit) || 1

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
                        max: max,
                        stepSize: step,
                        maxTicksLimit: maxTickLimit
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

export const SlotsClicksAndRevenue = ({ data, options, t }) => {
    data = data.reduce((memo, item) => {
        memo.labels.push(item.name)
        memo.clicks.push(item.clicks)
        memo.amounts.push(item.amount)

        memo.stepClicks.min = Math.min(memo.stepClicks.min, item.clicks)
        memo.stepClicks.max = Math.max(memo.stepClicks.max, item.clicks)
        memo.stepAmounts.min = Math.min(memo.stepAmounts.min, item.amount)
        memo.stepAmounts.max = Math.max(memo.stepAmounts.max, item.amount)

        return memo

    }, { labels: [], clicks: [], amounts: [], stepClicks: { min: 0, max: 0 }, stepAmounts: { min: 0, max: 0 } })

    let commonDsProps = {
        fill: true,
        lineTension: 0.4,
        borderWidth: 0,
        pointRadius: 1,
        pointHitRadius: 10,
    }

    let chartData = {
        labels: data.labels,
        stacked: false,
        datasets: [
            {
                ...commonDsProps,
                label: t('CHART_LABEL_CLICKS'),
                data: data.clicks,
                backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[0], 0.6),
                yAxisID: 'y-axis-2'
            },
            {
                ...commonDsProps,
                label: t('CHART_LABEL_REVENUE'),
                data: data.amounts,
                backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[2], 0.6),
                yAxisID: 'y-axis-1'
            }
        ]
    }

    const linesOptions = {
        elements: {
            line: {
                fill: false
            }
        },
        tooltips: {
            mode: 'x-axis'
        },
        scales: {
            xAxes: [
                {
                    display: true,
                    gridLines: {
                        display: true,
                        beginAtZero: true
                    },
                    // labels: {
                    //     show: true
                    // }
                }
            ],
            yAxes: [
                {
                    //stacked: false,
                    type: 'linear',
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                    gridLines: {
                        display: true,
                        borderDash: [4, 4],
                        color: Helper.hexToRgbaColorString(CHARTS_COLORS[0], 0.5)
                    },
                    ticks: {
                        beginAtZero: true
                    }
                    // labels: {
                    //     show: true
                    // }
                },
                {
                    // stacked: true,
                    type: 'linear',
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    gridLines: {
                        display: true,
                        borderDash: [4, 4],
                        color: Helper.hexToRgbaColorString(CHARTS_COLORS[2], 0.5)
                    },
                    ticks: {
                        beginAtZero: true
                    }
                    // labels: {
                    //     show: true
                    // }
                }
            ]
        }
    }

    return (
        <Line data={chartData} options={linesOptions} />
    )
}

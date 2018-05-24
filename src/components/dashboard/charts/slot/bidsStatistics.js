import React from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { CHARTS_COLORS, hexColorsToRgbaArray } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'

export const BidsTimeStatistics = ({ data, options = {}, t }) => {

    if (!Object.keys(data).length) return null
    data = Object.keys(data).reduce((memo, key) => {
        const item = data[key]

        memo.labels.push(key)
        memo.clicks.push(item.clicks || 0)
        memo.uniqueClicks.push(item.uniqueClicks || 0)
        memo.loaded.push(item.loaded || 0)

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
    const max = data.step.max || 1
    const min = data.step.min || 0
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
                        // maxTicksLimit: maxTickLimit + 1
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
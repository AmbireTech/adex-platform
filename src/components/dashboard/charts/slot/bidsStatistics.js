import React from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { CHARTS_COLORS, hexColorsToRgbaArray } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'

export const SlotsClicksAndRevenue = ({ data, options }) => {
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
                label: 'Clicks',
                data: data.clicks,
                backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[0], 0.6),
                yAxisID: 'y-axis-2'
            },
            {
                ...commonDsProps,
                label: 'Revenue',
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

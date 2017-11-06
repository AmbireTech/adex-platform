import React from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { CHARTS_COLORS, hexColorsToRgbaArray } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'

export const SlotsClicksAndRevenue = ({ data, options }) => {
    data = data.reduce((memo, item) => {
        memo.labels.push(item.name)
        memo.clicks.push(item.clicks)
        memo.amounts.push(item.amount)

        return memo

    }, { labels: [], clicks: [], amounts: [] })

    let chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Clicks',
                data: data.clicks,
                fill: true,
                lineTension: 0.1,
                backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[0], 0.7),
                borderWidth: 0,
                pointRadius: 1,
                pointHitRadius: 10,
                yAxisID: 'y-axis-2'
            },
            {
                label: 'Revenue',
                data: data.amounts,                
                fill: true,
                lineTension: 0.1,
                backgroundColor: Helper.hexToRgbaColorString(CHARTS_COLORS[1], 0.7),
                borderWidth: 0,
                pointRadius: 1,
                pointHitRadius: 10,
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
                        display: false
                    },
                    // labels: {
                    //     show: true
                    // }
                }
            ],
            yAxes: [
                {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                    // gridLines: {
                    //     display: false
                    // },
                    // labels: {
                    //     show: true
                    // }
                },
                {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    // gridLines: {
                    //     display: false
                    // },
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

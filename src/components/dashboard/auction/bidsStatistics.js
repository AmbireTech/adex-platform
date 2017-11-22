import React from 'react'
import { Bar, Doughnut, Line, HorizontalBar } from 'react-chartjs-2'
import { CHARTS_COLORS, hexColorsToRgbaArray } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'
import numeral from 'numeral'

export const BidsStatisticsChart = ({ data, options, t }) => {
    let datasets = data.reduce((memo, bid, index) => {
        let color = Helper.hexToRgbaColorString(CHARTS_COLORS[index % (CHARTS_COLORS.length - 1)], 0.9)
        if (bid.execution === 'none') {
            color = Helper.hexToRgbaColorString(CHARTS_COLORS[CHARTS_COLORS.length - 1], index % 2 === 0 ? 0.9 : 0.6)
        }

        let label = numeral(bid.price).format('$ 0,0.00')

        if (bid.execution === 'partial') {
            label = label + ' (' + numeral(bid.wonNumber).format('0,0') + ')'
        }

        let dataset = {
            ...commonDsProps,
            stack: 'Bids',
            label: label,
            data: [bid.count],
            backgroundColor: color,
            // yAxisID: 'y-axis-2'
        }

        memo.datasets.push(dataset)

        return memo

    }, { datasets: [] }).datasets

    let commonDsProps = {
        fill: true,
        lineTension: 0.4,
        borderWidth: 0,
        pointRadius: 1,
        pointHitRadius: 10,
    }

    let chartData = {
        type: 'horizontalBar',
        labels: ['Bids'],
        stacked: true,
        datasets: datasets
    }

    const linesOptions = {
        elements: {
            line: {
                fill: false
            }
        },
        scales: {
            yAxes: [
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
            xAxes: [
                {
                    stacked: true,
                    display: true,

                    gridLines: {
                        display: true,
                        borderDash: [4, 4],
                        color: Helper.hexToRgbaColorString(CHARTS_COLORS[0], 0.5)
                    },
                    ticks: {
                        beginAtZero: true
                    },
                    labels: {
                        show: true
                    }
                }
            ]
        }
    }

    return (
        <HorizontalBar data={chartData} options={linesOptions} height={30} />
    )
}

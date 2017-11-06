import React from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'
import { CHARTS_COLORS, hexColorsToRgbaArray } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'
import merge from 'lodash.merge'

const mapStatsData = (data) => {

    data = Object.keys(data).reduce((memo, key) => {
        memo.labels.push(key)
        memo.count.push(data[key])

        return memo

    }, { labels: [], count: [] })

    let chartData = {
        labels: data.labels,
        data: data.count
    }

    return chartData
}

export const BidsStatusBars = ({ data, options }) => {
    let mappedData = mapStatsData(data)
    let chartData = {
        labels: mappedData.labels,
        datasets: [
            {
                label: 'Bids',
                backgroundColor: CHARTS_COLORS[0],
                // borderColor: CHARTS_COLORS[3],
                hoverBackgroundColor: CHARTS_COLORS[0],
                // hoverBorderColor: CHARTS_COLORS[3],
                borderWidth: 0,
                data: mappedData.data
            }
        ]
    }

    let barsOptions = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
                gridLines: {
                    borderDash: [4, 4],
                    zeroLineBorderDashOffset: 10
                }
            }],
            xAxes: [{
                gridLines: {
                    borderDash: [4, 4]
                }
            }]
        }
    }

    return (
        <Bar
            data={chartData}
            options={barsOptions}
        />
    )
}

export const BidsStatusPie = ({ data, options }) => {
    let mappedData = mapStatsData(data)
    // let colors = hexColorsToRgbaArray(CHARTS_COLORS, 1)
    let chartData = {
        labels: mappedData.labels,
        datasets: [
            {
                label: 'Bids',
                backgroundColor: CHARTS_COLORS,
                // borderColor: CHARTS_COLORS,
                hoverBackgroundColor: CHARTS_COLORS,
                // hoverBorderColor: CHARTS_COLORS,
                borderWidth: 0,
                data: mappedData.data
            }
        ]
    }

    return (
        <Doughnut
            data={chartData}
        />
    )
}

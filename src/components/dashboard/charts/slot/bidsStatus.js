import React from 'react'
import { Bar, Doughnut, Chart, Pie } from 'react-chartjs-2'
import { CHARTS_COLORS, hexColorsToRgbaArray } from 'components/dashboard/charts/options'
import Helper from 'helpers/miscHelpers'
import merge from 'lodash.merge'

const mapStatsData = (data) => {

    data = Object.keys(data).reduce((memo, key) => {
        let label = key
        const count = parseInt(data[key], 10)

        label += ' [' + count + ']'

        memo.labels.push(label)
        memo.count.push(count)
        memo.totalCount += count

        return memo

    }, { labels: [], count: [], totalCount: 0 })

    let chartData = {
        labels: data.labels,
        data: data.count,
        totalCount: data.totalCount
    }

    return chartData
}

export const BidsStatusPie = ({ data, options = {}, t, onPieClick }) => {
    let mappedData = mapStatsData(data)
    // let colors = hexColorsToRgbaArray(CHARTS_COLORS, 1)

    let opts = {
        responsive: true,
        cutoutPercentage: 70,
        legend: {
            position: 'left'
        },
        tooltips: {
            callbacks: {
                label: function (tooltipItem, data) {
                    let label = (data.labels[tooltipItem.index] || '').split(' [')[0]
                    label += ': '
                    let count = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]
                    label += count
                    label += ' (' + ((count / mappedData.totalCount) * 100).toFixed(2) + '%)'

                    return label
                }
            }
        },
        ...options,
    }

    let chartData = {
        labels: mappedData.labels,
        datasets: [
            {
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
            options={opts}
            getElementAtEvent={(e) => {
                onPieClick(e[0])
            }}
        />
    )
}

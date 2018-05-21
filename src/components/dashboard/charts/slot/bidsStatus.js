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

export const BidsStatusPie = ({ data, options, t }) => {
    let mappedData = mapStatsData(data)
    // let colors = hexColorsToRgbaArray(CHARTS_COLORS, 1)
    let chartData = {
        labels: mappedData.labels,
        datasets: [
            {
                label: t('CHART_LABEL_BIDS'),
                backgroundColor: CHARTS_COLORS,
                // borderColor: CHARTS_COLORS,
                hoverBackgroundColor: CHARTS_COLORS,
                // hoverBorderColor: CHARTS_COLORS,
                borderWidth: 0,
                data: mappedData.data
            }
        ],
        options: { responsive: true },
        legend: {
            display: true,
            position: 'bottom'
        }
    }

    return (
        <Doughnut
            data={chartData}
        />
    )
}

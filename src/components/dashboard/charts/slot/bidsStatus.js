import React from 'react'
import { Doughnut, Chart, Pie } from 'react-chartjs-2'
import { CHARTS_COLORS, hexColorsToRgbaArray } from 'components/dashboard/charts/options'

export const BidsStatusPie = ({ pieData = {}, options = {}, t, onPieClick }) => {
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
                    label += ' (' + ((count / pieData.totalCount) * 100).toFixed(2) + '%)'

                    return label
                }
            }
        },
        ...options,
    }

    let chartData = {
        labels: pieData.labels || [],
        datasets: [
            {
                backgroundColor: CHARTS_COLORS,
                // borderColor: CHARTS_COLORS,
                hoverBackgroundColor: CHARTS_COLORS,
                // hoverBorderColor: CHARTS_COLORS,
                borderWidth: 0,
                data: pieData.data || []
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

import React from 'react'
import { Doughnut} from 'react-chartjs-2'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'

export const BidsStatusPie = ({ pieData = {}, options = {}, t, onPieClick }) => {
    const isMobile = window.innerWidth <= 768

    let opts = {
        responsive: true,
        cutoutPercentage: 70,
        legend: {
            position: isMobile ? 'top' : 'left',
            fullWidth: true,
            labels: {
                generateLabels:  function (chart) {
                    chart.legend.afterFit = function () {
                        if (this.lineWidths) {
                            this.lineWidths = this.lineWidths.map( () => this.width )
                        }
                    }
                    var data = chart.data

                    if (data.labels.length && data.datasets.length) {
                        return data.labels.map((label, i) => {
                            var ds = data.datasets[0]
                            var fill = ds.backgroundColor[i]

                            return {
                                text: label,
                                fillStyle: fill,
                                index: i
                            };
                        });
                    }
                    return [];
                }
            }
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
        maintainAspectRatio: false,
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
            height={isMobile ? 400 : 200}
            options={opts}
            getElementAtEvent={(e) => {
                onPieClick(e[0])
            }}
        />
    )
}

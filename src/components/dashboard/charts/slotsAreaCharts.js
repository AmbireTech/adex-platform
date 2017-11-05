import React from 'react'
import { Line, Doughnut } from 'react-chartjs-2'

export const SlotsClicksChartsAlt = ({ data }) => {
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
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                yAxisID: 'y-axis-2'
            },
            {
                label: 'Revenue',
                data: data.amounts,
                fill: true,
                lineTension: 0.1,
                backgroundColor: 'rgba(25,65,166,0.4)',
                borderColor: 'rgba(33,89,112,1)',
                borderCapStyle: 'butt',
                borderDash: [],
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(75,192,192,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 2,
                pointRadius: 1,
                pointHitRadius: 10,
                yAxisID: 'y-axis-1'
            }
        ]
    }

    const options = {
        responsive: true,
        tooltips: {
            mode: 'label'
        },
        elements: {
            line: {
                fill: false
            }
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
                    gridLines: {
                        display: false
                    },
                    labels: {
                        show: true
                    }
                },
                {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    gridLines: {
                        display: false
                    },
                    labels: {
                        show: true
                    }
                }
            ]
        }
    }

    return (
        <Line data={chartData} options={options} />
    )
}

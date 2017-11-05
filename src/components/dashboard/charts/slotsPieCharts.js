import React from 'react'
import { Line, Doughnut } from 'react-chartjs-2'

const COLORS = ['#FF0AF3', '#E86D0B', '#FFFB1F', '#11E883', '#5B72FF', '#38E81D']

export const SlotsBidsAlt = ({ data }) => {

    console.log('data', data)
    data = Object.keys(data).reduce((memo, item) => {
        memo.labels.push(item)
        memo.counts.push(data[item])
        return memo

    }, { labels: [], counts: [] })

    let chartData = {
        labels: data.labels,
        datasets: [
            {
                data: data.counts,
                backgroundColor: COLORS
            }
        ]
    }

    console.log(chartData)

    return (
        <Doughnut data={chartData} />
    )
}

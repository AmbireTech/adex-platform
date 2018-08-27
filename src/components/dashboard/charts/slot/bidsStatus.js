import React from 'react'
import { Doughnut} from 'react-chartjs-2'
import { CHARTS_COLORS } from 'components/dashboard/charts/options'
import { BidsLegend } from '.'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class BidsStatusPie extends React.Component {
    render() {
        const pieData = this.props.pieData || {}
        const options = this.props.options || {}
        const { onPieClick } = this.props
        const classes = this.props.classes

        const isMobile = window.innerWidth <= 768
        const pieDataExists = pieData.totalCount > 0

        let opts = {
            responsive: true,
            responsiveAnimationDuration: 1000,
            cutoutPercentage: 70,
            legend: {
                display: false
            },
            legendCallback: function(chart) {
                return <BidsLegend chart={chart}/>
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
            maintainAspectRatio: true,
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
            <div className={classes.chartParent}>
                <h3 className={classes.chartTitle}>{this.props.chartTitle}</h3>
                <div className={classes.chartLabel}>
                    {this.refs && this.refs.doughnut ? this.refs.doughnut.chartInstance.generateLegend() : this.forceUpdate()}
                </div>
                <div className={classes.chartContainer}>
                    <Doughnut
                        ref='doughnut'
                        data={chartData}
                        options={opts}
                        getElementAtEvent={(e) => {
                            onPieClick(e[0])
                        }}
                    />
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(BidsStatusPie)
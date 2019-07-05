import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class BidsLegend extends Component {
	toggleChartItem(e, index) {
		const chart = this.props.chart

		chart.legend.options.onClick.call(chart, e, chart.legend.legendItems[index])
	}

	toggleLabelCross(label) {
		label.style.textDecoration === 'line-through' ? label.style.textDecoration = 'none' : label.style.textDecoration = 'line-through'
	}

	render() {
		const { chart, classes } = this.props
		return (
			<div>
				<ul className={classes.legendList}>
					{chart.data.datasets[0].data.map((item, i) => {
						return (
							<li
								key={i}
								className={classes.legendListItem}
								onClick={(event) => {
									this.toggleChartItem(event, i)
									this.toggleLabelCross(event.currentTarget)
								}}
							>
								<span
									style={{ backgroundColor: chart.data.datasets[0].backgroundColor[i] }}
									className={classes.legendSpan}
								>
								</span>
								{chart.data.labels[i] ? chart.data.labels[i] : null}
							</li>
						)
					})}
				</ul>
			</div>
		)
	}
}
export default withStyles(styles)(BidsLegend)
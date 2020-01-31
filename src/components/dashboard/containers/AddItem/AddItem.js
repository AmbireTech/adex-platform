import React, { Component } from 'react'
import PropTypes from 'prop-types'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { AdUnitsTable } from 'components/dashboard/containers/Tables'
import Translate from 'components/translate/Translate'
import { ContentBox, ContentBody } from 'components/common/dialog/content'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

export class AddItem extends Component {
	constructor(props) {
		super(props)
		this.state = {
			active: false,
			tabIndex: 0,
		}
	}

	handleTabChange = (ev, index) => {
		this.setState({ tabIndex: index })
	}

	render() {
		const { classes, ...rest } = this.props
		const { tabIndex } = this.state
		const NewForm = this.props.newForm
		return (
			<div>
				<ContentBox>
					<AppBar position='static' className={classes.appBar} color='primary'>
						<Tabs
							className={''}
							value={tabIndex}
							onChange={this.handleTabChange}
							scrollable
							scrollButtons='off'
						>
							<Tab label={this.props.tabNewLabel} />
							<Tab label={this.props.tabExsLabel} />
						</Tabs>
					</AppBar>
					<div className={classes.tabsContainer}>
						{tabIndex === 0 && (
							<ContentBody>
								<NewForm
									{...this.props}
									stepperProps={{ stepperClasses: classes.stepperBody }}
								/>
							</ContentBody>
						)}

						{tabIndex === 1 && (
							<ContentBody>
								<AdUnitsTable
									items={this.props.items}
									// noSearch
									noActions
									noDownload
									noPrint
								/>
							</ContentBody>
						)}
					</div>
				</ContentBox>
			</div>
		)
	}
}

AddItem.propTypes = {
	btnLabel: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	floating: PropTypes.bool,
	listMode: PropTypes.string,
	tabNewLabel: PropTypes.string.isRequired,
	tabExsLabel: PropTypes.string.isRequired,
	objModel: PropTypes.func.isRequired,
}

export default Translate(withStyles(styles)(AddItem))

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import DatePicker from 'components/common/DatePicker'
import NewItemHoc from './NewItemHocStep'
import Grid from '@material-ui/core/Grid'
import Translate from 'components/translate/Translate'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes } = ItemsConstants

class NewCampaignForm extends Component {

	render() {
		let item = this.props.item
		let from = item.from ? new Date(item.from) : null
		let to = item.to ? new Date(item.to) : null
		let now = new Date()
		now.setHours(0, 0, 0, 0)
		return (
			<Grid
				container
				spacing={16}
			>
				<Grid item sm={12} md={6}>
					<DatePicker
						fullWidth
						calendarIcon
						label={this.props.t('from', { isProp: true })}
						minDate={now}
						maxDate={to}
						onChange={(val) => this.props.handleChange('from', val)}
						value={from}
					/>
				</Grid>
				<Grid item sm={12} md={6}>
					<DatePicker
						fullWidth
						calendarIcon
						label={this.props.t('to', { isProp: true })}
						minDate={from || now}
						onChange={(val) => this.props.handleChange('to', val)}
						value={to}
					/>
				</Grid>
			</Grid>
		)
	}
}

NewCampaignForm.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string
};

function mapStateToProps(state) {
	let persist = state.persist
	let memory = state.memory
	return {
		account: persist.account,
		newItem: memory.newItem[ItemsTypes.Campaign.id]
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	};
}

const ItemNewCampaignForm = NewItemHoc(NewCampaignForm)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(ItemNewCampaignForm))

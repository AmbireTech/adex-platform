import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Campaign } from 'adex-models'

export default function NewCampaignHoc(Decorated) {
	class ItemForm extends Component {
		constructor(props) {
			super(props)

			this.save = this.save.bind(this)

			this.state = {
				active: false,
				saved: false,
			}
		}

		handleChange = (prop, value, newValues) => {
			this.props.actions.updateNewItem(
				this.props.newItem,
				newValues || { [prop]: value },
				'Campaign',
				Campaign
			)
		}

		onSave = () => {
			const { closeDialog } = this.props
			if (closeDialog) {
				closeDialog()
			}
		}

		save = async () => {
			const { actions, newItem } = this.props
			const { temp } = newItem
			const newTemp = { ...temp }
			newTemp.waitingAction = true
			this.handleChange('temp', newTemp)
			await actions.openCampaign({ campaign: newItem })

			newTemp.waitingAction = false
			this.handleChange('temp', newTemp)
			this.onSave()
			actions.resetNewItem('Campaign')
		}

		cancel = () => {
			this.onSave()
			this.props.actions.resetNewItem('Campaign')
		}

		render() {
			const { classes, ...rest } = this.props
			return (
				<Decorated
					{...rest}
					save={this.save}
					handleChange={this.handleChange}
					cancel={this.cancel}
				/>
			)
		}
	}

	ItemForm.propTypes = {
		actions: PropTypes.object.isRequired,
		newItem: PropTypes.object.isRequired,
		title: PropTypes.string,
		addTo: PropTypes.object,
	}

	function mapStateToProps(state, props) {
		const { persist, memory } = state

		const adUnits = persist.items['AdUnit'] || {}
		const adUnitsArray = Object.values(adUnits) || []
		return {
			newItem: new Campaign(memory.newItem['Campaign']),
			adUnits,
			adUnitsArray,
			spinner: memory.spinners['opening-campaign'],
		}
	}

	function mapDispatchToProps(dispatch) {
		return {
			actions: bindActionCreators(actions, dispatch),
		}
	}

	return connect(
		mapStateToProps,
		mapDispatchToProps
	)(ItemForm)
}

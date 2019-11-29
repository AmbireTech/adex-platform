import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { AdUnit } from 'adex-models'

export default function NewAdUnitHoc(Decorated) {
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
				'AdUnit',
				AdUnit
			)
		}

		onSave = () => {
			const { closeDialog } = this.props
			if (closeDialog) {
				closeDialog()
			}
		}

		save = () => {
			const { actions, newItem } = this.props
			actions.addUnit(newItem)

			this.onSave()
			actions.resetNewItem('AdUnit')
		}

		cancel = () => {
			this.onSave()
			this.props.actions.resetNewItem('AdUnit')
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
		const { memory } = state
		return {
			newItem: new AdUnit(memory.newItem['AdUnit']),
			loadingTargetingSuggestions: memory.spinners['targeting-suggestions'],
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

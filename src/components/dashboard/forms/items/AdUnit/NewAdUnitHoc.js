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

			this.save = this.save.bind(this);

			this.state = {
				active: false,
				saved: false
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
			const { actions, newItem, account, addTo } = this.props
			newItem.owner = account.wallet.address
	
			actions.addItem(newItem, addTo, account.wallet.authSig)
			actions.resetNewItem('AdUnit')

			this.onSave()
		}

		cancel = () => {
			this.props.actions.resetNewItem('AdUnit')
			this.onSave()
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
		account: PropTypes.object.isRequired,
		newItem: PropTypes.object.isRequired,
		title: PropTypes.string,
		addTo: PropTypes.object
	}

	function mapStateToProps(state, props) {
		const { persist, memory } = state
		return {
			account: persist.account,
			newItem: new AdUnit(memory.newItem['AdUnit'])
		}
	}

	function mapDispatchToProps(dispatch) {
		return {
			actions: bindActionCreators(actions, dispatch)
		}
	}

	return connect(
		mapStateToProps,
		mapDispatchToProps
	)(ItemForm)
}


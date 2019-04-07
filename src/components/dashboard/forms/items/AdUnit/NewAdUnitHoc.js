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
				item: {},
				saved: false
			}
		}

		componentWillReceiveProps(nextProps) {
			this.setState({ item: nextProps.newItem })
		}

		componentWillMount() {
			this.setState({ item: this.props.newItem })
		}

		// Works when inside dialog because when no active its content is unmounted
		// componentWillUnmount() {
		//     this.updateItemInStore()
		// }

		handleChange = (prop, value) => {
			this.props.actions.updateNewItem(this.props.newItem, { [prop]: value }, 'AdUnit', AdUnit)
		}

		onSave = () => {
			// TODO:.....
			if (typeof this.props.onSave === 'function') {
				this.props.onSave()
			}

			if (Array.isArray(this.props.onSave)) {
				for (var index = 0; index < this.props.onSave.length; index++) {
					if (typeof this.props.onSave[index] === 'function') {
						this.props.onSave[index]()
					}
				}
			}
		}

		save = () => {
			const { actions, newItem, account } = this.props
			const item = new AdUnit(newItem)

			// this.setState({ saved: true }, () => {
			actions.addItem(item, this.props.addTo, account._wallet.authSig)
			actions.resetNewItem(this.state.item, 'AdUnit')

			this.onSave()
		}

		cancel = () => {
			this.props.actions.resetNewItem(this.state.item)

			this.onSave()
		}

		render() {
			const { newItem } = this.props
			
			let item = new AdUnit(newItem) || {}
			return (
				<Decorated
					{...this.props}
					item={item}
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

	// return ItemForm

	function mapStateToProps(state, props) {
		const { persist, memory } = state
		return {
			account: persist.account,
			newItem: memory.newItem['AdUnit']
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


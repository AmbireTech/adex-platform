import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { AdUnit } from 'adex-models'

const testUnit = {
	archived: false,
	created: Date.now(),
	description: "some description", // TODO: not required in models
	ipfs: "",
	mediaMime: "",
	mediaUrl: "",
	modified: null,
	owner: "",
	tags: [
		{
			score: 18,
			tag: "adult entertainment"
		}],

	targetUrl: "https://www.adex.network",
	targeting: [
		{
			score: 74,
			tag: "location_NG"
		}],
	temp: {
		height: 250,
		mime: "image/jpeg",
	},

	title: "test unit",
	type: "legacy_300x250"
}

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
			const { actions, newItem, account, addTo } = this.props
			newItem.owner = account.wallet.address

			const test = testUnit
			test.temp = newItem.temp
	
			actions.addItem(test, addTo, account.wallet.authSig)
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


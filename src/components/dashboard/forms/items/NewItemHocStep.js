import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Models } from 'adex-models'

export default function NewItemHoc(Decorated) {

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
        	this.props.actions.updateNewItem(this.props.newItem, { [prop]: value })
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
        	let itemType = this.props.newItem._type || this.props.newItem._meta.type || this.props.itemType
        	let item = new Models.itemClassByTypeId[itemType](this.props.newItem) || {}
        	let acc = this.props.account

        	// this.setState({ saved: true }, () => {
        	this.props.actions.addItem(item, this.props.addTo, acc._authSig)
        	this.props.actions.resetNewItem(this.state.item)

        	this.onSave()
        }

        cancel = () => {
        	this.props.actions.resetNewItem(this.state.item)

        	this.onSave()
        }

        // updateItemInStore() {
        //     if (!this.state.saved && this.state.item) {
        //         this.props.actions.updateNewItem(this.state.item, this.state.item._meta)
        //     }
        // }

        render() {
        	let itemType = this.props.newItem._type || this.props.newItem._meta.type || this.props.itemType
        	let item = new Models.itemClassByTypeId[itemType](this.props.newItem) || {}
        	const props = this.props

        	return (
        		<Decorated {...props} item={item} save={this.save} handleChange={this.handleChange} cancel={this.cancel}/>
        	)
        }
	}

	ItemForm.propTypes = {
		actions: PropTypes.object.isRequired,
		account: PropTypes.object.isRequired,
		newItem: PropTypes.object.isRequired,
		title: PropTypes.string,
		addTo: PropTypes.object,
		itemModel: PropTypes.func.isRequired
	}

	// return ItemForm

	function mapStateToProps(state, props) {
		let persist = state.persist
		let memory = state.memory
		return {
			account: persist.account,
			newItem: memory.newItem[props.itemType]
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


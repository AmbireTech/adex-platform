import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'

export default function NewItemHoc(Decorated) {

	class ValidItemHoc extends Component {
		constructor(props) {
			super(props)

			this.state = {
				invalidFields: {}
			}

			this.validate = this.validate.bind(this)
		}

		componentWillReceiveProps(nextProps) {
			this.setState({ invalidFields: nextProps.validations || {} })
		}

		componentWillMount() {
			this.setState({ invalidFields: this.props.validations || {} })
		}

        validate = (key, { isValid, err = { msg: '', args: [] }, dirty = false, removeAll = false }) => {

        	if (!isValid) {
        		let errors = {}
        		errors[key] = {
        			errMsg: this.props.t(err.msg, { args: err.args }),
        			dirty: dirty
        		}

        		this.props.actions.updateValidationErrors(this.props.validateId, errors)
        	} else if (removeAll) {
        		this.props.actions.resetValidationErrors(this.props.validateId)
        	} else {
        		this.props.actions.resetValidationErrors(this.props.validateId, key)
        	}
        }

        render() {
        	const props = this.props
        	return (
        		<Decorated {...props} validate={this.validate} invalidFields={this.state.invalidFields} />
        	)
        }
	}

	ValidItemHoc.propTypes = {
		actions: PropTypes.object.isRequired,
		validateId: PropTypes.string.isRequired
	}

	function mapStateToProps(state, props) {
		// let persist = state.persist
		let memory = state.memory
		return {
			validations: memory.validations[props.validateId]
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
	)(Translate(ValidItemHoc))
}


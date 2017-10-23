import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'

export default function NewItemHoc(Decorated) {

    class ValidItemHoc extends Component {
        constructor(props) {
            super(props)

            this.state = {
                invalidFields: {}
            }
        }

        componentWillReceiveProps(nextProps) {
            this.setState({ invalidFields: nextProps.validations || {} })
        }

        componentWillMount() {
            this.setState({ invalidFields: this.props.validations || {} })
        }

        validate(key, value, validator, errorMsg) {
            let isValid = validator(value)

            if (!isValid) {
                let errors = {}
                errors[key] = errorMsg

                this.props.actions.updateValidationErrors(this.props.validateId, errors)
            } else (
                this.props.actions.resetValidationErrors(this.props.validateId)
            )
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
        return {
            account: state.account,
            validations: state.validations[props.validateId]
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
    )(ValidItemHoc)
}


import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'

// TODO: Make it some kind of common HOC
export default function SigninStepHocStep(Decorated) {

    class SigninForm extends Component {
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
            this.setState({ item: nextProps.signin })
        }

        componentWillMount() {
            this.setState({ item: this.props.signin })
        }

        handleChange = (name, value) => {
            this.props.actions.updateSignin(name, value)
        }

        save() {
            // TODO: what to do on save :)
            this.props.actions.resetSignin()

            if (typeof this.props.onSave === 'function') {
                this.props.onSave()
            }

            if (Array.isArray(this.props.onSave)) {
                for (var index = 0; index < this.props.onSave.length; index++) {
                    if (typeof this.props.onSave[index] === 'function') {
                        this.props.onSave[index].onSave()
                    }
                }
            }
        }

        render() {

            let item = this.props.signin || {}
            const props = this.props

            return (
                <Decorated {...props} signin={item} save={this.save} handleChange={this.handleChange} />
            )
        }
    }

    SigninForm.propTypes = {
        actions: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        signin: PropTypes.object.isRequired,
        title: PropTypes.string
    }

    function mapStateToProps(state, props) {
        return {
            account: state.account,
            signin: state.account.signin
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
    )(SigninForm)
}


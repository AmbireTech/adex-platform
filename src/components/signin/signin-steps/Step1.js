import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemTypesNames } from 'constants/itemsTypes'
import SigninStepHocStep from './SigninStepHocStep'
import Input from 'react-toolbox/lib/input'
import Translate from 'components/translate/Translate'

class Step1 extends Component {

    render() {
        let signin = this.props.signin
        let t = this.props.t
        return (
            <div>
                <Input
                    type='text'
                    label='Name'
                    value={signin.name}
                    onChange={this.props.handleChange.bind(this, 'name')}
                    maxLength={128} >
                </Input>
                <Input
                    type='email'
                    label='Email'
                    value={signin.email}
                    onChange={this.props.handleChange.bind(this, 'email')}
                    maxLength={128} >
                </Input>
                <Input
                    type='password'
                    label='Password'
                    value={signin.password}
                    onChange={this.props.handleChange.bind(this, 'password')}
                    maxLength={128} >
                </Input>
                <Input
                    type='password'
                    label='Confirm password'
                    value={signin.passConfirm}
                    onChange={this.props.handleChange.bind(this, 'passConfirm')}
                    maxLength={128} >
                </Input>
            </div>
        )
    }
}

Step1.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string,
}

function mapStateToProps(state, props) {
    return {
        account: state.account
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

const SigninStep1 = SigninStepHocStep(Step1)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(SigninStep1))

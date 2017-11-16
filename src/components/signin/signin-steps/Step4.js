import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import SigninStepHocStep from './SigninStepHocStep'
import Input from 'react-toolbox/lib/input'
import Translate from 'components/translate/Translate'
import Helper from 'helpers/miscHelpers'
import { Button } from 'react-toolbox/lib/button'
import RTButtonTheme from 'styles/RTButton.css'

class Step4 extends Component {

    componentDidMount() {
        // TODO: Disable stepper going back
        // TODO: Set the data to account.account and save the public key and encrypted seed to the local storage
        this.props.actions.resetSignin()
    }

    render() {
        let signin = this.props.signin
        let t = this.props.t

        return (
            <div>
                <h1>
                    {t('SIGNIN_SUCCESS')}
                </h1>
                <h3>
                    {t('CLICK_SIGNIN_SUCCESS')}
                </h3>
            </div>
        )
    }
}

Step4.propTypes = {
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

const SigninStep4 = SigninStepHocStep(Step4)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(SigninStep4))

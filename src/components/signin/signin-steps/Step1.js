import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemTypesNames } from 'constants/itemsTypes'
import SigninStepHocStep from './SigninStepHocStep'
import Input from 'react-toolbox/lib/input'
import Translate from 'components/translate/Translate'
import { validEmail } from 'helpers/validators'

const DISABLE_VALIDATION = true

class Step1 extends Component {

    componentDidMount() {
        if (DISABLE_VALIDATION) return

        if (!this.props.signin.name) {
            this.props.validate('name', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
        if (!this.props.signin.email) {
            this.props.validate('email', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
        if (!this.props.signin.password) {
            this.props.validate('password', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
    }

    validateName(name, dirty) {
        if (DISABLE_VALIDATION) return

        let msg = ''
        let errMsgArgs = []
        if (!name) {
            msg = 'ERR_REQUIRED_FIELD'
        } else if (name.length < 4) {
            msg = 'ERR_MIN_LENGTH'
            errMsgArgs.push(4)
        } else if (name.length > 128) {
            msg = 'ERR_MAX_LENGTH'
            errMsgArgs.push(128)
        }

        this.props.validate('name', { isValid: !msg, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
    }

    validateEmail(email, dirty) {
        if (DISABLE_VALIDATION) return

        this.props.validate.bind(this, 'email', { isValid: validEmail(email), err: { msg: 'ERR_INVALID_EMAIL' }, dirty: dirty })
    }

    validatePassword(pass, dirty) {
        if (DISABLE_VALIDATION) return

        let msg = ''
        let errMsgArgs = []
        if (!pass) {
            msg = 'ERR_REQUIRED_FIELD'
        } else if (pass.length < 4) {
            msg = 'ERR_MIN_LENGTH'
            errMsgArgs.push(4)
        } else if (pass.length > 128) {
            msg = 'ERR_MAX_LENGTH'
            errMsgArgs.push(128)
        }

        this.props.validate('password', { isValid: !msg, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
    }

    validatePasswordConfirm(confirm, dirty) {
        if (DISABLE_VALIDATION) return

        let msg = ''
        let errMsgArgs = []
        if ((!!confirm || !!this.props.signin.password) && (confirm !== this.props.signin.password)) {
            msg = 'ERR_PASSWORDS_NOT_MATCH'
        }

        this.props.validate('passConfirm', { isValid: !msg, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
    }

    render() {
        let signin = this.props.signin
        let t = this.props.t
        let errName = this.props.invalidFields['name']
        let errEmail = this.props.invalidFields['email']
        let errPassword = this.props.invalidFields['password']
        let errPassConfirm = this.props.invalidFields['passConfirm']
        return (
            <div>
                <Input
                    type='text'
                    label='Name'
                    value={signin.name}
                    onChange={this.props.handleChange.bind(this, 'name')}
                    maxLength={128}
                    onBlur={this.validateName.bind(this, signin.name, true)}
                    onFocus={this.validateName.bind(this, signin.name, false)}
                    error={errName && !!errName.dirty ?
                        <span> {errName.errMsg} </span> : null}
                >
                </Input>
                <Input
                    type='email'
                    label='Email'
                    value={signin.email}
                    onChange={this.props.handleChange.bind(this, 'email')}
                    maxLength={128}
                    onBlur={this.validateEmail.bind(this, signin.email, true)}
                    onFocus={this.validateEmail.bind(this, signin.email, false)}
                    error={errEmail && !!errEmail.dirty ? <span> {errEmail.errMsg} </span> : null}
                >
                </Input>
                <Input
                    type='password'
                    label='Password'
                    value={signin.password}
                    onChange={this.props.handleChange.bind(this, 'password')}
                    maxLength={128}
                    onBlur={this.validatePassword.bind(this, signin.password, true)}
                    onFocus={this.validatePassword.bind(this, signin.password, false)}
                    error={errPassword && !!errPassword.dirty ?
                        <span> {errPassword.errMsg} </span> : null}
                >
                    {!errPassword ?
                        <div>
                            {t('HELPER_PASSWORD', { args: [4, 1, 1] })}
                        </div> : null}
                </Input>
                <Input
                    type='password'
                    label='Confirm password'
                    value={signin.passConfirm}
                    onChange={this.props.handleChange.bind(this, 'passConfirm')}
                    maxLength={128}
                    onBlur={this.validatePasswordConfirm.bind(this, signin.passConfirm, true)}
                    onFocus={this.validatePasswordConfirm.bind(this, signin.passConfirm, false)}
                    error={errPassConfirm && !!errPassConfirm.dirty ?
                        <span> {errPassConfirm.errMsg} </span> : null}
                >
                    {!errPassConfirm ?
                        <div>
                            {t('HELPER_PASSWORD_CONFIRM')}
                        </div> : null}
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

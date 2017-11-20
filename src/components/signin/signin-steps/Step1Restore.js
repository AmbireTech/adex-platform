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

class Step1Restore extends Component {

    componentDidMount() {
        if (DISABLE_VALIDATION) return

        if (!this.props.signin.name) {
            this.props.validate('name', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
        if (!this.props.signin.seed) {
            this.props.validate('seed', {
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

    validateSeed(seed, dirty) {
        if (DISABLE_VALIDATION) return

        let msg = ''
        let errMsgArgs = []
        let seeds = seed.split(' ').length

        if (!seed) {
            msg = 'ERR_REQUIRED_FIELD'
        } else if (seeds !== 12) {
            msg = 'ERR_SEED_WORDS'
            errMsgArgs.push(12)
        }

        this.props.validate('seed', { isValid: !msg, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
    }

    render() {
        let signin = this.props.signin
        let t = this.props.t
        let errName = this.props.invalidFields['name']
        let errPassword = this.props.invalidFields['password']
        let errSeed = this.props.invalidFields['seed']
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
                    type='text'
                    label='Seed'
                    value={signin.seed}
                    onChange={this.props.handleChange.bind(this, 'seed')}
                    maxLength={256}
                    onBlur={this.validateName.bind(this, signin.name, true)}
                    onFocus={this.validateName.bind(this, signin.name, false)}
                    error={errSeed && !!errSeed.dirty ?
                        <span> {errSeed.errMsg} </span> : null}
                >
                    {!errSeed ?
                        <div>
                            {t('HELPER_SEED_RECOVER', { args: [12] })}
                        </div> : null}
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

            </div>
        )
    }
}


const SigninStep1Restore = SigninStepHocStep(Step1Restore)
export default Translate(SigninStep1Restore)

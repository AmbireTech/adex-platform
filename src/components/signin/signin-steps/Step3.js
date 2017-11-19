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

const SEED_WORDS_CHECK_COUNT = 0
const DISABLE_VALIDATION = false

class Step3 extends Component {

    componentWillMount() {
        let signin = this.props.signin
        let seed = signin.seed

        let randomSeedChecks = [...(signin.seedCheck || [])]
        if (!randomSeedChecks.length) {
            while (SEED_WORDS_CHECK_COUNT && true) {
                let randIndex = Helper.getRandomInt(0, signin.seed.length - 1)
                let hasThisCheck = !!randomSeedChecks.filter((check) => check.index === randIndex).length
                if (!hasThisCheck) {
                    randomSeedChecks.push({
                        index: randIndex,
                        value: signin.seed[randIndex],
                        checkValue: ''
                    })
                }
                if (randomSeedChecks.length === SEED_WORDS_CHECK_COUNT) {
                    this.props.handleChange('seedCheck', randomSeedChecks)
                    break
                }
            }
        }

        if (DISABLE_VALIDATION) return

        this.props.validate('seedCheck', { isValid: false, err: { msg: 'ERR_SEED_CHECK', }, dirty: false })
    }

    validateSeedCheck = () => {
        if (DISABLE_VALIDATION) return

        let signin = this.props.signin
        let hasError = false
        let seedCheck = signin.seedCheck

        for (let i = 0; i < seedCheck.length; i++) {
            let check = seedCheck[i]
            if (check.value !== check.checkValue) {
                hasError = true
                break
            }
        }

        this.props.validate('seedCheck', { isValid: !hasError, err: { msg: 'ERR_SEED_CHECK', }, dirty: true })
    }

    handleChange = (index, value) => {
        let newSeedCheck = [...this.props.signin.seedCheck]
        let newValue = { ...newSeedCheck[index] }
        newValue.checkValue = value
        newSeedCheck[index] = newValue
        this.props.handleChange('seedCheck', newSeedCheck)
    }

    render() {
        let signin = this.props.signin
        let seedCheck = signin.seedCheck || []
        let t = this.props.t
        let errSeedCheck = this.props.invalidFields['seedCheck']
        return (
            <div>
                {
                    seedCheck.map((seed, index) => {
                        return (
                            <Input
                                key={seed.value + index}
                                type='text'
                                label={'Position ' + (seed.index + 1)}
                                value={seedCheck[index].checkValue}
                                onChange={this.handleChange.bind(this, index)}
                                maxLength={seed.value.length} >
                            </Input>
                        )
                    })
                }

                {errSeedCheck && errSeedCheck.dirty ?
                    <Button label={t(errSeedCheck.errMsg)} onClick={this.validateSeedCheck} raised className={RTButtonTheme.danger} />
                    :
                    <Button label={t('CHECK_SEED')} onClick={this.validateSeedCheck} raised primary />
                }

            </div>
        )
    }
}

const SigninStep3 = SigninStepHocStep(Step3)
export default Translate(SigninStep3)

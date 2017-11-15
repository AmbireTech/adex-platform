import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import SigninStepHocStep from './SigninStepHocStep'
import Input from 'react-toolbox/lib/input'
import Translate from 'components/translate/Translate'
import Helper from 'helpers/miscHelpers'

class Step3 extends Component {

    componentDidMount() {
        let signin = this.props.signin
        let seed = signin.seed

        let randomSeedChecks = [...(signin.seedCheck || [])]
        if (!randomSeedChecks.length) {
            while (true) {
                let randIndex = Helper.getRandomInt(0, signin.seed.length - 1)
                let hasThisCheck = !!randomSeedChecks.filter((check) => check.index === randIndex).length
                if (!hasThisCheck) {
                    randomSeedChecks.push({
                        index: randIndex,
                        value: signin.seed[randIndex],
                        checkValue: ''
                    })
                }
                if (randomSeedChecks.length === 4) {
                    this.props.handleChange('seedCheck', randomSeedChecks)
                    break
                }
            }
        }
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
        return (
            <div>
                {
                    seedCheck.map((seed, index) => {
                        return (
                            <Input
                                key={seed.value + index}
                                type='text'
                                label={'Position ' + seed.index}
                                value={seedCheck[index].checkValue}
                                onChange={this.handleChange.bind(this, index)}
                                maxLength={seed.value.length} >
                            </Input>
                        )
                    })
                }
            </div>
        )
    }
}

Step3.propTypes = {
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

const SigninStep3 = SigninStepHocStep(Step3)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(SigninStep3))

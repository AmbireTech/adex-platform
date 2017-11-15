import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import SigninStepHocStep from './SigninStepHocStep'
import Chip from 'react-toolbox/lib/chip'
import Translate from 'components/translate/Translate'
import lightwallet from 'eth-lightwallet'

const keystore = lightwallet.keystore

class Step2 extends Component {

    componentDidMount() {
        let signin = this.props.signin
        let seed = signin.seed

        let randomSeed = []
        if (!seed.length) {
            let extraEntropy = signin.name + signin.email + signin.password + Date.now()
            randomSeed = keystore.generateRandomSeed(extraEntropy)
            randomSeed = randomSeed.split(' ')
            this.props.handleChange('seed', randomSeed)
        } else {
            randomSeed = signin.seed
        }
    }

    render() {
        let signin = this.props.signin

        let t = this.props.t
        return (
            <div>
                <h2> This is your seed, please write it on paper or memorize it.</h2>
                <h4> We will check that on the next step :) </h4>
                {
                    signin.seed.map((seed, index) => {
                        return (
                            <Chip key={index + seed}> {seed} </Chip>
                        )
                    })
                }
            </div>
        )
    }
}

Step2.propTypes = {
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

const SigninStep2 = SigninStepHocStep(Step2)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(SigninStep2))

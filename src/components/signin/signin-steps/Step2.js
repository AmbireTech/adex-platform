import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import SigninStepHocStep from './SigninStepHocStep'
import Chip from 'react-toolbox/lib/chip'
import Avatar from 'react-toolbox/lib/avatar'
import Translate from 'components/translate/Translate'
import lightwallet from 'eth-lightwallet'

const keystore = lightwallet.keystore

const TextIcon = ({ txt }) => (
    <svg viewBox="0 0 32 32" width="32px" height="32px">
        <g>
            <text x="50%" y="50%" textAnchor="middle" fontSize="18">{txt}</text>
        </g>
    </svg>
)

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
                <h2>{t('MEMORIZE_SEED')}</h2>
                <h4>{t('MEMORIZE_SEED_WARNING')}</h4>
                {
                    signin.seed.map((seed, index) => {
                        return (
                            <Chip key={index + seed}>
                                <Avatar icon={<TextIcon txt={(index + 1).toString()} />} />
                                <span> {seed} </span>
                            </Chip>
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

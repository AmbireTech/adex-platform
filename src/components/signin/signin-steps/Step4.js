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
import ProgressBar from 'react-toolbox/lib/progress_bar'
import RTButtonTheme from 'styles/RTButton.css'
import lightwallet from 'eth-lightwallet'

const keyStore = lightwallet.keystore
const HD_PATH = "m/0'/0'/0'" // TODO: check this
const SPINNER_KEY = 'SIGNIN_STEP_4'

class Step4 extends Component {

    createVault() {
        let that = this
        let signin = this.props.signin
        let password = signin.password
        let seed = signin.seed.join(' ')

        keyStore.createVault({
            password: password,
            seedPhrase: seed,
            salt: signin.name,
            hdPathString: HD_PATH // TODO: check it
        }, function (err, ks) {
            if (err) throw err // TODO: make global error handler!!!

            ks.keyFromPassword(password, function (err, pwDerivedKey) {
                if (err) throw err

                ks.generateNewAddress(pwDerivedKey, 1);
                var addr = ks.getAddresses()

                that.onVaultCreated({ addr: addr })

                ks.passwordProvider = function (callback) {
                    var pw = prompt("Please enter password", "Password");
                    callback(null, pw)
                }
            })
        })
    }

    onVaultCreated({ addr }) {
        this.props.handleChange('publicKey', addr[0])
        this.props.actions.updateSpinner(SPINNER_KEY, false)
        this.props.actions.resetSignin()
    }

    componentWillMount() {
        this.props.actions.updateSpinner(SPINNER_KEY, true)
        this.createVault()
    }

    componentDidMount() {
        // TODO: Disable stepper going back
        // TODO: Set the data to account.account and save the public key and encrypted seed to the local storage
    }

    render() {
        let signin = this.props.signin
        let t = this.props.t

        return (
            <div>
                {this.props.spinner ?
                    <ProgressBar type='circular' mode='indeterminate' multicolor />
                    :
                    <div>
                        <h1>
                            {t('SIGNIN_SUCCESS')}
                        </h1>
                        <h2> {t('SIGNIN_SUCCESS_YOUR_ADDRESS')} </h2>
                        <h2> {signin.publicKey} </h2>
                        <h3>
                            {t('CLICK_SIGNIN_SUCCESS')}
                        </h3>
                    </div>
                }
            </div>
        )
    }
}

Step4.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string,
    spinner: PropTypes.bool
}

function mapStateToProps(state, props) {
    return {
        account: state.account,
        spinner: state.spinners[SPINNER_KEY]
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

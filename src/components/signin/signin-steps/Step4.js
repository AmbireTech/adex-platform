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
import Account from 'models/Account'

import { web3 } from 'services/smart-contracts/ADX'

const keyStore = lightwallet.keystore
const HD_PATH = "m/44'/60'/0'/0"
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
            hdPathString: HD_PATH
        }, function (err, ks) {
            if (err) {
                console.log('err', err)
                throw err // TODO: make global error handler!!!
            }

            // TODO: Should we keep ks object global?
            ks.keyFromPassword(password, function (err, pwDerivedKey) {
                if (err) {
                    console.log('err', err)
                    throw err
                }

                ks.generateNewAddress(pwDerivedKey, 1);
                var addr = ks.getAddresses()

                that.onVaultCreated({ addr: addr[0] })

                // Add to web3
                var acc = web3.eth.accounts.privateKeyToAccount(ks.exportPrivateKey(addr[0], pwDerivedKey))

                console.log(acc)
                // TODO: add to web3

                // TODO: make some dialog some day 
                ks.passwordProvider = function (callback) {
                    var pw = prompt("Please enter password", "Password");
                    callback(null, pw)
                }
            })
        })
    }

    onVaultCreated({ addr }) {
        this.props.handleChange('publicKey', addr)
        this.props.actions.updateSpinner(SPINNER_KEY, false)

        let acc = new Account({ addr: addr, name: this.props.signin.name })

        this.props.actions.createAccount(acc)

        // this.props.actions.resetSignin()
    }

    componentWillMount() {
        this.props.validate('createVault', { isValid: false, err: { msg: 'ERR_CREATE_VAULT', }, dirty: false })
        this.props.actions.updateSpinner(SPINNER_KEY, true)
        this.createVault()
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.spinner) {
            this.props.validate('createVault', { isValid: true, err: { msg: 'ERR_CREATE_VAULT', }, dirty: false })
        }
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
    spinner: PropTypes.bool
}

function mapStateToProps(state, props) {
    let memory = state.memory
    return {
        spinner: memory.spinners[SPINNER_KEY]
    };
}

const SigninStep4 = SigninStepHocStep(Step4)
export default connect(
    mapStateToProps
)(Translate(SigninStep4))

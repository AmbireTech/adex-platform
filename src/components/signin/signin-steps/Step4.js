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
// import lightwallet from 'eth-lightwallet'
import Account from 'models/Account'
import KeyStore from 'services/key-store/keyStore'

import { web3 } from 'services/smart-contracts/ADX'

// const keyStore = lightwallet.keystore
// const HD_PATH = "m/44'/60'/0'/0"
export const SPINNER_KEY = 'SIGNIN_STEP_4'

class Step4 extends Component {

    createVault() {
        let that = this
        let signin = this.props.signin
        let password = signin.password
        // Just in case of restore for easier input at the moment
        let seed = signin.seed.split(' ').filter(entry => /\S/.test(entry)).join(' ')

        KeyStore.createVault({
            password: password,
            seedPhrase: seed,
            salt: signin.name,
            // hdPathString: HD_PATH
        })
            .then((ks) => {
                // TODO: Should we keep ks object global? - it is now
                ks.keyFromPassword(password, function (err, pwDerivedKey) {
                    if (err) {
                        console.log('err', err)
                        throw err
                    }

                    ks.generateNewAddress(pwDerivedKey, 1);
                    let addr = ks.getAddresses()

                    // Add to web3
                    // NOTE: because of the way web3 works, it needs key prefixed with 0x
                    // see https://github.com/ethereum/web3.js/issues/1094
                    let privateKey = '0x' + ks.exportPrivateKey(addr[0], pwDerivedKey)

                    // console.log('privateKey', privateKey)

                    let acc = web3.eth.accounts.privateKeyToAccount(privateKey)
                    let wallet = web3.eth.accounts.wallet
                    wallet.add(acc)

                    // Temp we will persist this data in the account until existing account login is ready
                    let tempForRecovery = {
                        seed: seed,
                        pwDerivedKey: pwDerivedKey,
                        password: password
                    }

                    that.onVaultCreated({ addr: addr[0], temp: tempForRecovery })

                    //console.log(acc)

                    // TODO: make some dialog some day 
                    ks.passwordProvider = function (callback) {
                        let pw = prompt("Please enter password", "Password");
                        callback(null, pw)
                    }
                })
            })
    }

    onVaultCreated({ addr, temp }) {
        this.props.handleChange('publicKey', addr)
        this.props.actions.updateSpinner(SPINNER_KEY, false)

        let acc = new Account({ addr: addr, name: this.props.signin.name, temp: temp })

        this.props.actions.createAccount(acc)
        this.props.validate('createVault', { isValid: true, err: { msg: 'ERR_CREATE_VAULT', }, dirty: false })

        // this.props.actions.resetSignin()
    }

    componentWillMount() {
        this.props.validate('createVault', { isValid: false, err: { msg: 'ERR_CREATE_VAULT', }, dirty: false })
        this.props.actions.updateSpinner(SPINNER_KEY, true)
        this.createVault()
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.spinner && this.props.spinner) {
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

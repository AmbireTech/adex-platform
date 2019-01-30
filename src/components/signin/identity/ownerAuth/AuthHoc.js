import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import { signToken, checkAuth } from 'services/adex-node/actions'
import scActions from 'services/smart-contracts/actions'
import { addSig, getSig } from 'services/auth/auth'
import IdentityHoc from '../IdentityHoc'
import ValidItemHoc from 'components/common/stepper/ValidItemHoc'

const { signAuthToken } = scActions

export default function AuthHoc(Decorated) {

    class Auth extends Component {
        constructor(props) {
            super(props)
            this.state = {
                method: '',
                sideSelect: false
            }
            console.log('proips', props)
        }

        componentWillMount() {
            // this.props.actions.resetAccount()
            // this.props.actions.resetAllItems()
        }

        updateAcc = ({ res, addr, signature, mode, authType, hdPath, chainId, addrIdx }) => {

            const owner = { addr, type: authType }

            this.props.actions.updateIdentity('owner', owner)
        }

        signAuth = ({ addr, hdPath, addrIdx, authType, chainId }) => {
            let signature = null
            let mode = null
            return signAuthToken({ userAddr: addr, authType, hdPath, addrIdx })
                .then(({ sig, sig_mode, authToken, typedData, hash } = {}) => {
                    this.props.handleChange('identityContractOwner', addr)
                    // this.props.validate('identityContractOwner', {
                    //     isValid: !!addr,
                    //     err: { msg: 'ERR_NO_IDENTITY_CONTRACT_OWNER' },
                    //     dirty: false
                    // })
                })
                .catch((err) => {
                    console.log('err', err)
                    this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_NO_IDENTITY_CONTRACT_OWNER'), timeout: 5000 })
                })
        }

        verifySignature = ({ addr, hdPath, addrIdx, authType, chainId }) => {
            return Promise.resolve()
                .then(() => {
                    return this.signAuth({ addr, hdPath, addrIdx, authType, chainId })
                })
                .then((res) => {
                    console.log('sign res', res)
                    // this.updateAcc()
                })
        }

        render() {
            return (
                <div>
                    <Decorated
                        {...this.props}
                        updateAcc={this.updateAcc}
                        verifySignature={this.verifySignature}
                    />
                </div>
            )
        }
    }

    Auth.propTypes = {
        actions: PropTypes.object.isRequired,
    }

    function mapStateToProps(state) {
        let persist = state.persist
        // let memory = state.memory
        return {
            account: persist.account
        }
    }

    function mapDispatchToProps(dispatch) {
        return {
            actions: bindActionCreators(actions, dispatch)
        }
    }

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(Translate(ValidItemHoc(IdentityHoc(Auth))))
}
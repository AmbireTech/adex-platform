import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import { signToken, checkAuth } from 'services/adex-node/actions'
import scActions from 'services/smart-contracts/actions'
import { addSig, getSig } from 'services/auth/auth'
const { signAuthToken } = scActions

export default function AuthHoc(Decorated) {

    class Auth extends Component {
        constructor(props) {
            super(props)
            this.state = {
                method: '',
                sideSelect: false
            }
        }

        componentWillMount() {
            // this.props.actions.resetAccount()
            // this.props.actions.resetAllItems()
        }

        updateAcc = ({ res, addr, signature, mode, authType, hdPath, chainId, addrIdx }) => {

            const owner = { addr, type }

            this.props.actions.updateIdentity(prop, value)
        }

        signAuth = ({ addr, hdPath, addrIdx, authType, chainId }) => {
            let signature = null
            let mode = null
            return signAuthToken({ userAddr: addr, authType, hdPath, addrIdx })
                .then(({ sig, sig_mode, authToken, typedData, hash } = {}) => {
                    signature = sig
                    mode = sig_mode
                    return signToken({ userid: addr, signature: signature, authToken, mode: mode, typedData, hash })
                })
                .then((res) => {
                    return this.updateAcc({ res, addr, signature, mode, authType, hdPath, chainId, addrIdx })
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
                        authOnServer={this.authOnServer}
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
    )(Translate(Auth))
}
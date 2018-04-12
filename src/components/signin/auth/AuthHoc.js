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
            this.props.actions.resetAccount()
            this.props.actions.resetAllItems()
        }

        signAuth = ({ addr, mode, hdPath, addrIdx, authMode, authType, chainId }) => {
            let signature = null
            return signAuthToken({ userAddr: addr, mode, hdPath, addrIdx })
                .then(({ sig, sig_mode, authToken, typedData, hash } = {}) => {
                    signature = sig
                    return signToken({ userid: addr, signature: signature, authToken, mode, typedData, hash })
                })
                .then((res) => {
                    if (res && res.status === 'OK') {
                        addSig({ addr: addr, sig: signature, mode: mode, expiryTime: res.expiryTime })
                        this.props.actions.updateAccount({ ownProps: { addr: addr, authMode, signType: mode, authType, authSig: signature, chainId, hdWalletAddrPath: hdPath, hdWalletAddrIdx: addrIdx } })
                        return true
                    } else {
                        this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_ON_SERVER'), timeout: 5000 })
                        throw new Error(this.props.t('ERR_AUTH_ON_SERVER'))
                    }
                })
        }

        authOnServer = ({ mode, addr, hdPath, addrIdx, authType, chainId }) => {
            let signature = getSig({ addr: addr, mode: mode }) || null

            addr = addr.toLowerCase()

            let authMode = {
                sigMode: mode,
                authType: authType
            }

            let p = null

            if (signature) {
                p = checkAuth({ authSig: signature })
            } else {
                p = Promise.resolve(false)
            }

            return p
                .then((res) => {
                    if (res) {
                        this.props.actions.updateAccount({ ownProps: { addr: addr, authMode, signType: mode, authType, authSig: signature, chainId, hdWalletAddrPath: hdPath, hdWalletAddrIdx: addrIdx } })
                        return true
                    } else {
                        return this.signAuth({ addr, mode, hdPath, addrIdx, authMode, authType, chainId })
                    }
                })
        }

        render() {
            let t = this.props.t
            let userAddr = this.props.account._addr
            // let authMode = this.props.account._authMode

            return (
                <div>
                    <Decorated
                        {...this.props}
                        authOnServer={this.authOnServer}
                    />
                </div>
            )
        }
    }

    Auth.propTypes = {
        actions: PropTypes.object.isRequired,
    }

    // 
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
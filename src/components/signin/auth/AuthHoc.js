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

        updateAcc = ({ res, addr, signature, mode, authType, hdPath, chainId, addrIdx }) => {
            if (res && res.status === 'OK') {
                addSig({ addr: addr, sig: signature, mode: authType, expiryTime: res.expiryTime })
                this.props.actions.updateAccount({ ownProps: { addr: addr, signType: mode, authType, authSig: signature, chainId, hdWalletAddrPath: hdPath, hdWalletAddrIdx: addrIdx } })
                return true
            } else {
                this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_ON_SERVER'), timeout: 5000 })
                throw new Error(this.props.t('ERR_AUTH_ON_SERVER'))
            }
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

        authOnServer = ({ addr, hdPath, addrIdx, authType, chainId }) => {
            let signature = getSig({ addr: addr, mode: authType }) || null
            addr = addr.toLowerCase()
            let p = null

            if (signature) {
                p = checkAuth({ authSig: signature, skipErrToast: true })
            } else {
                p = Promise.resolve(false)
            }

            return p
                .then((res) => {
                    if (res) {
                        this.props.actions.updateAccount({ ownProps: { addr: addr, signType: res.sigMode, authType, authSig: signature, chainId, hdWalletAddrPath: hdPath, hdWalletAddrIdx: addrIdx } })
                        return true
                    } else {
                        return this.signAuth({ addr, hdPath, addrIdx, authType, chainId })
                    }
                })
                .catch((err) => {
                    if (err && (err.status === 401 || err.status === 403)) {
                        return this.signAuth({ addr, hdPath, addrIdx, authType, chainId })
                    } else {
                        throw err
                    }
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
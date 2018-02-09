import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import Logo from 'components/common/icons/AdexIconTxt'
import { Button } from 'react-toolbox/lib/button'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import { getWeb3 } from 'services/smart-contracts/ADX'
import SideSelect from 'components/signin/side-select/SideSelect'
import { signToken } from 'services/adex-node/actions'
import scActions from 'services/smart-contracts/actions'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'
import { addSig, getSig } from 'services/auth/auth'

const { signAuthTokenMetamask, signAuthToken, getAccountMetamask } = scActions

const RRButton = withReactRouterLink(Button)

class AuthMetamask extends Component {
    constructor(props) {
        super(props)
        this.state = {
            method: '',
            sideSelect: false
        }
    }

    authOnServer = () => {
        let signature = null
        let addr = this.props.account._addr
        // let authToken = 'someAuthTOken'
        let mode = EXCHANGE_CONSTANTS.SIGN_TYPES.Metamask.id // TEMP?

        signAuthTokenMetamask({ userAddr: addr })
            .then(({ sig, sig_mode, authToken, typedData }) => {
                signature = sig
                return signToken({ userid: addr, signature: signature, authToken: authToken, mode: mode, typedData: typedData })
            })
            .then((res) => {
                // TEMP
                // TODO: keep it here or make it on login?
                // TODO: catch
                if (res === 'OK') {
                    addSig({ addr: addr, sig: signature, mode: mode })

                    this.props.actions.updateAccount({ ownProps: { addr: addr, authMode: mode, authSig: signature } })
                } else {
                    this.props.actions.resetAccount()
                }
            })
    }

    // TODO: Make it some common function if needed or make timeout as metamask way 
    checkMetamask = () => {
        getAccountMetamask()
            .then(({ addr, mode }) => {

                if (!addr) {
                    this.props.actions.resetAccount()
                } else {
                    this.props.actions.updateAccount({ ownProps: { addr: addr, authMode: mode, authSig: getSig({ addr: addr, mode: mode }) } })
                }
            })
    }

    render() {
        let t = this.props.t
        let userAddr = this.props.account._addr
        let authMode = this.props.account._authMode

        return (
            <div >
                {userAddr ?
                    <Button onClick={this.authOnServer} label={t('AUTH_WITH_METAMASK')} raised accent />
                    :
                    <Button onClick={this.checkMetamask} label={t('CONNECT_WITH_METAMASK')} raised accent />
                }
            </div>
        )
    }
}

AuthMetamask.propTypes = {
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

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(AuthMetamask))
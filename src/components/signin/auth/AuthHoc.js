import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import theme from './theme.css'
import { Button } from 'react-toolbox/lib/button'
import Translate from 'components/translate/Translate'
// import { getWeb3 } from 'services/smart-contracts/ADX'
// import SideSelect from 'components/signin/side-select/SideSelect'
import { signToken } from 'services/adex-node/actions'
import scActions from 'services/smart-contracts/actions'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'
import { addSig, getSig } from 'services/auth/auth'
import { checkAuth } from 'services/adex-node/actions'
import METAMASK_DL_IMG from 'resources/download-metamask.png'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'

const { signAuthToken } = scActions

// const RRButton = withReactRouterLink(Button)

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
        if (!getSig({ addr: this.props.account._addr, mode: this.props.account._authMode })) {
            this.props.actions.resetAccount()
        }
    }

    authOnServer = ({ mode, addr, hdPath, addrIdx }) => {
        let signature = null

        signAuthToken({ userAddr: addr, mode, hdPath, addrIdx })
            .then(({ sig, sig_mode, authToken, typedData, hashData }) => {
                signature = sig
                return signToken({ userid: addr, signature: signature, authToken, mode, typedData, hashData })
            })
            .then((res) => {
                // TEMP
                // TODO: keep it here or make it on login?
                // TODO: catch
                if (res.status === 'OK') {
                    addSig({ addr: addr, sig: signature, mode: mode, expiryTime: res.expiryTime })

                    this.props.actions.updateAccount({ ownProps: { addr: addr, authMode: mode, authSig: signature } })
                } else {
                    this.props.actions.resetAccount()
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
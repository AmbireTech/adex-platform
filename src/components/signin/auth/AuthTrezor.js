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
// import { signToken } from 'services/adex-node/actions'
// import scActions from 'services/smart-contracts/actions'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'
// import { addSig, getSig } from 'services/auth/auth'
// import { checkAuth } from 'services/adex-node/actions'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import trezorConnect from 'third-party/trezor-connect'
const TrezorConnect = trezorConnect.TrezorConnect

// const { signAuthTokenMetamask, getAccountMetamask } = scActions

const path = "m/44'/60'/0'/0";

// const RRButton = withReactRouterLink(Button)

class AuthTrezor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            method: '',
            sideSelect: false
        }
    }

    connectTrezor = () => {
        TrezorConnect.getXPubKey(path, function (result) {
            if (result.success) {
                console.log('Address: ', result);
            } else {
                console.error('Error:', result);
            }
        })
    }

    render() {
        let t = this.props.t
        // let authMode = this.props.account._authMode

        return (
            <div >
                <span>
                    TREZOR info here...
                </span>
                <br/>
                <h3>
                    <Anchor href='https://trezor.io' target='_blank'>
                        https://trezor.io
                    </Anchor>
                </h3>
                <br/>
                <br/>
                    <Button onClick={this.connectTrezor} label={t('AUTH_CONNECT_WITH_TREZOR')} raised primary />
            </div>
        )
    }
}

AuthTrezor.propTypes = {
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
)(Translate(AuthTrezor))
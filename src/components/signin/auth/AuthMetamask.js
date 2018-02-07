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

const { signAuthToken } = scActions

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
        let acc = this.props.account
        let authToken = 'someAuthTOken'
        signAuthToken({ userAddr: acc._addr, authToken: authToken })
            .then((sig) => {
                signature = sig
                return signToken({ userid: acc._addr, signature: signature, authToken: authToken })
            })
            .then((res) => {
                // TEMP
                // TODO: keep it here or make it on login?
                // TODO: catch
                if (res === 'OK') {
                    localStorage.setItem('addr-metamask-' + acc._addr, signature)

                    this.props.actions.updateAccount({ ownProps: { addr: acc._addr, authMode: 'metamask' } })
                }
            })
    }

    // TODO: Make it some common function if needed or make timeout as metamask way 
    checkMetamask = () => {
        getWeb3.then(({ web3 }) => {

            web3.eth.getAccounts((err, accounts) => {
                let user = accounts[0]

                if (err || !user) {
                    this.props.actions.resetAccount()
                } else {
                    this.props.actions.updateAccount({ ownProps: { addr: user, authMode: 'metamask' } })
                }
            })
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
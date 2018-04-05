import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Button } from 'react-toolbox/lib/button'
import Translate from 'components/translate/Translate'
// import { getWeb3 } from 'services/smart-contracts/ADX'
// import SideSelect from 'components/signin/side-select/SideSelect'
import scActions from 'services/smart-contracts/actions'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'
import { addSig, getSig } from 'services/auth/auth'
import { checkAuth } from 'services/adex-node/actions'
import METAMASK_DL_IMG from 'resources/download-metamask.png'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import AuthHoc from './AuthHoc'
import { AUTH_TYPES } from 'constants/misc'
import { TabBox, TabBody, TabStickyTop, TopLoading } from './AuthCommon'
import Helper from 'helpers/miscHelpers'

const { getAccountMetamask } = scActions

// const RRButton = withReactRouterLink(Button)

class AuthMetamask extends Component {
    constructor(props) {
        super(props)
        this.state = {
            method: '',
            sideSelect: false,
            waitingMetamaskAction: false,
        }
    }

    componentWillMount() {
        if (!getSig({ addr: this.props.account._addr, mode: this.props.account._authMode })) {
            this.props.actions.resetAccount()
        }
    }

    authOnServer = () => {
        let addr = this.props.account._addr
        let mode = AUTH_TYPES.METAMASK.signType // TEMP?
        let authType = AUTH_TYPES.METAMASK.name
        this.setState({ waitingMetamaskAction: true }, () =>
            this.props.authOnServer({ mode, addr, authType })
                .then()
                .catch((err) => {
                    this.setState({ waitingMetamaskAction: false })
                    this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_METAMASK', { args: [Helper.getErrMsg(err)] }), timeout: 5000 })
                })
        )
    }

    // TODO: Make it some common function if needed or make timeout as metamask way 
    // TODO: Keep signature expire time, and check again on the node for session 
    checkMetamask = () => {
        // TODO: make it better
        let sig = null
        let userAddr = null
        let sigMode = null
        let chainId = null
        let t = this.props.t
        getAccountMetamask()
            .then(({ addr, mode, netId }) => {
                chainId = netId
                sigMode = mode
                if (!addr) {
                    this.props.actions.resetAccount()
                    this.props.actions.addToast({ type: 'warning', action: 'X', label: t('AUTH_WARN_NO_METAMASK_ADDR'), timeout: 5000 })
                } else {
                    userAddr = addr
                    let authSig = getSig({ addr: addr, mode: mode })
                    return authSig
                }
            })
            .then((authSig) => {
                if (authSig) {
                    sig = authSig
                    return checkAuth({ authSig })
                } else {
                    this.props.actions.updateAccount({ ownProps: { addr: userAddr, authMode: sigMode, authSig: null } })
                    return false
                }
            })
            .then((res) => {
                if (res) {
                    this.props.actions.updateAccount({ ownProps: { addr: userAddr, authMode: sigMode, chainId, authSig: getSig({ addr: userAddr, mode: sigMode }) } })
                }
            })
            .catch((err) => {
                this.props.actions.updateAccount({ ownProps: { addr: userAddr, authMode: sigMode, authSig: null } })
                this.props.actions.addToast({ type: 'cancel', action: 'X', label: t('AUTH_ERR_METAMASK', { args: [err] }), timeout: 5000 })
            })
    }

    render() {
        let t = this.props.t
        let userAddr = this.props.account._addr
        // let authMode = this.props.account._authMode

        return (
            <TabBox >
                {this.state.waitingMetamaskAction ?
                    <TabStickyTop>
                        <TopLoading msg={t('METAMASK_WAITING_ACTION')} />
                    </TabStickyTop> 
                : null }
                <TabBody>
                    <span>
                        {t('METAMASK_INFO')}
                    </span>
                    <br />
                    <h3>
                        <Anchor href='https://metamask.io/' target='_blank'>
                            <Img src={METAMASK_DL_IMG} alt={'Downlad metamask'} style={{ maxWidth: '100%', maxHeight: '72px' }} />
                        </Anchor>
                    </h3>
                    <br />
                    <br />
                    {userAddr ?
                        <div >
                            <div className={theme.metamaskLAbel}>
                                {t('AUTH_WITH_METAMASK_LABEL', { args: [userAddr] })}
                            </div>
                            <Button
                                onClick={this.authOnServer}
                                label={t('AUTH_WITH_METAMASK_BTN', { args: [userAddr] })}
                                raised
                                accent
                                disabled={this.state.waitingMetamaskAction}
                                icon={this.state.waitingMetamaskAction ? 'hourglass_empty' : ''}
                            />
                        </div>
                        :
                        <Button onClick={this.checkMetamask} label={t('AUTH_CONNECT_WITH_METAMASK')} raised primary />
                    }
                </TabBody>
            </TabBox>
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
)(Translate(AuthHoc(AuthMetamask)))
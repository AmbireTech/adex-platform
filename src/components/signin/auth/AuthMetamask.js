import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Button } from 'react-toolbox/lib/button'
import Translate from 'components/translate/Translate'
import scActions from 'services/smart-contracts/actions'
import METAMASK_DL_IMG from 'resources/download-metamask.png'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import AuthHoc from './AuthHoc'
import { AUTH_TYPES } from 'constants/misc'
import { AddrItem } from './AuthCommon'
import Helper from 'helpers/miscHelpers'
import { ContentBox, ContentBody, ContentStickyTop, TopLoading } from 'components/common/dialog/content'

const { getAccountMetamask, getAccountStats } = scActions

// const RRButton = withReactRouterLink(Button)

class AuthMetamask extends Component {
    constructor(props) {
        super(props)
        this.state = {
            method: '',
            sideSelect: false,
            address: {},
            waitingMetamaskAction: false,
            waitingAddrsData: false
        }

        this.accountInterval = null
    }

    componentWillMount() {
        this.props.actions.resetAccount()
        this.accountInterval = setInterval(this.checkForMetamaskAccountChange, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.accountInterval)
    }

    checkForMetamaskAccountChange = () => {
        getAccountMetamask()
            .then(({ addr, mode }) => {
                let stateAddr = this.state.address.addr

                if (stateAddr && (stateAddr.toLowerCase() !== (addr || '').toLowerCase())) {
                    this.setState({ address: {} })
                }
            })
    }

    authOnServer = () => {
        let addr = this.state.address.addr
        let mode = AUTH_TYPES.METAMASK.signType // TEMP?
        let authType = AUTH_TYPES.METAMASK.name
        this.setState({ waitingMetamaskAction: true }, () =>
            this.props.authOnServer({ mode, addr, authType })
                .then(() => {
                    // this.setState({ waitingMetamaskAction: false })
                })
                .catch((err) => {
                    this.setState({ waitingMetamaskAction: false })
                    this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_METAMASK', { args: [Helper.getErrMsg(err)] }), timeout: 5000 })
                })
        )
    }

    checkMetamask = () => {
        let t = this.props.t
        getAccountMetamask()
            .then(({ addr, netId }) => {
                if (!addr) {
                    this.setState({ address: {} })
                    this.props.actions.addToast({ type: 'warning', action: 'X', label: t('AUTH_WARN_NO_METAMASK_ADDR'), timeout: 5000 })
                    return null
                } else {
                    this.setState({ waitingAddrsData: true })
                    return getAccountStats({ _addr: addr, authType: AUTH_TYPES.METAMASK.name })
                }
            })
            .then((stats) => {
                this.setState({ address: stats || {}, waitingAddrsData: false, })
            })
            .catch((err) => {
                this.props.actions.addToast({ type: 'cancel', action: 'X', label: t('AUTH_ERR_METAMASK', { args: [err] }), timeout: 5000 })
                this.setState({ waitingAddrsData: false, address: {} })
            })
    }

    render() {
        let t = this.props.t
        let stats = this.state.address
        let userAddr = stats.addr

        return (
            <ContentBox className={theme.tabBox} >
                {this.state.waitingMetamaskAction ?
                    <ContentStickyTop>
                        <TopLoading msg={t('METAMASK_WAITING_ACTION')} />
                    </ContentStickyTop>
                    : this.state.waitingAddrsData ?
                        <TopLoading msg={t('METAMASK_WAITING_ADDR_INFO')} />
                        : null
                }
                <ContentBody>
                    <p>
                        {t('METAMASK_INFO')}
                    </p>
                    <br />
                    <p
                        dangerouslySetInnerHTML={
                            {
                                __html: t('METAMASK_BASIC_USAGE_INFO',
                                    {
                                        args: [{
                                            component:
                                                <Anchor href='https://metamask.io/' target='_blank'> https://metamask.io/</Anchor>
                                        }]
                                    })
                            }
                        }
                    />
                    <br />
                    <h3>
                        <Anchor href='https://metamask.io/' target='_blank'>
                            <Img src={METAMASK_DL_IMG} alt={'Downlad metamask'} style={{ maxWidth: '100%', maxHeight: '72px' }} />
                        </Anchor>
                    </h3>
                    <br />
                    <br />
                    {userAddr ?
                        <div>
                            <div className={theme.metamaskLAbel}>
                                {stats ?
                                    <AddrItem stats={stats} t={t} addr={userAddr} />
                                    : t('AUTH_WITH_METAMASK_LABEL', { args: [userAddr] })
                                }

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
                        <Button onClick={this.checkMetamask} label={t('AUTH_CONNECT_WITH_METAMASK')} raised primary disabled={this.state.waitingAddrsData} />
                    }
                </ContentBody>
            </ContentBox>
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
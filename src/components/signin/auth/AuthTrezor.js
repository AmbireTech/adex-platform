import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Button } from 'react-toolbox/lib/button'
import Translate from 'components/translate/Translate'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'
import { addSig, getSig } from 'services/auth/auth'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import { List, ListItem } from 'react-toolbox/lib/list'
import { getAddrs } from 'services/hd-wallet/utils'
import scActions from 'services/smart-contracts/actions'
import trezorConnect from 'third-party/trezor-connect'
import { adxToFloatView } from 'services/smart-contracts/utils'
import { web3Utils } from 'services/smart-contracts/ADX'
import AuthHoc from './AuthHoc'
import { AUTH_TYPES } from 'constants/misc'
import { AddrItem } from './AuthCommon'
import { ContentBox, ContentBody, ContentStickyTop, TopLoading } from 'components/common/dialog/content'
import Helper from 'helpers/miscHelpers'

const TrezorConnect = trezorConnect.TrezorConnect

const { getAccountStats } = scActions

const HD_PATH = "m/44'/60'/0'/0"

class AuthTrezor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            method: '',
            sideSelect: false,
            addresses: [],
            waitingTrezorAction: false,
            waitingAddrsData: false
        }
    }

    componentWillUnmount() {
        // NOTE: Closing the trezor window when auth method is changed
        TrezorConnect.close()
    }

    connectTrezor = () => {

        this.setState({ waitingTrezorAction: true }, () => {
            try {
                TrezorConnect.getXPubKey(HD_PATH, (result) => {
                    if (result.success) {
                        let addresses = getAddrs(result.publicKey, result.chainCode)

                        let allStatsPr = []

                        addresses.forEach((addr) => {
                            allStatsPr.push(getAccountStats({ _addr: addr }))
                        })

                        this.setState({ waitingAddrsData: true }, () => {
                            Promise.all(allStatsPr)
                                .then((results) => {
                                    this.setState({ addresses: results, waitingAddrsData: false, waitingTrezorAction: false })
                                })
                                .catch((err) => {
                                    this.setState({ waitingTrezorAction: false, waitingAddrsData: false })
                                })
                        })

                    } else {
                        console.error('Error:', result)
                        this.setState({ waitingTrezorAction: false })
                        this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_TREZOR', { args: [result.error] }), timeout: 5000 })
                    }
                })
            } catch (err) {
                // NOTE: catch if trezor popup is opened
                // TODO: kee it like this or us store to track the trezor  popup state
                // NOTE: Now this can be triggered if you are open the trezor popup, change the tab of auth method return to and again press the button, if you stay in the trezor tab it should not be a problem
                console.error('Error: catch', err)
                // this.setState({waitingTrezorAction: false})
                this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_TREZOR', { args: [Helper.getErrMsg(err)] }), timeout: 5000 })
            }
        })
    }

    AddressSelect = ({ addresses, waitingTrezorAction, t, ...rest }) => {
        return (
            <ContentBox className={theme.tabBox} >
                <ContentStickyTop>
                    {waitingTrezorAction ?
                        <TopLoading msg={t('TREZOR_WAITING_ACTION')} />
                        :
                        t('SELECT_ADDR_TREZOR')
                    }
                </ContentStickyTop>
                <ContentBody>
                    <List selectable ripple >
                        {addresses.map((res, index) =>
                            <ListItem
                                key={res.addr}
                                onClick={this.onAddrSelect.bind(this, res.addr, index)}
                                itemContent={<AddrItem stats={res} t={t} addr={res.addr} />}
                            />
                        )}
                    </List>
                </ContentBody>
            </ContentBox>
        )
    }

    onAddrSelect = (addr, index) => {
        this.setState({ waitingTrezorAction: true }, () => {
            let mode = AUTH_TYPES.TREZOR.signType // TEMP?
            let authType = AUTH_TYPES.TREZOR.name
            this.props.authOnServer({ mode, addr, authType, hdPath: HD_PATH, addrIdx: index })
                .then((res) => {
                })
                .catch((err) => {
                    console.log(err)
                    this.setState({ waitingTrezorAction: false, waitingAddrsData: false })
                    this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_TREZOR', { args: [(err || {}).error || err] }), timeout: 5000 })
                })
        })
    }

    render() {
        let t = this.props.t
        // let authMode = this.props.account._authMode

        return (
            <div>
                {this.state.addresses.length ?
                    <this.AddressSelect
                        waitingTrezorAction={this.state.waitingTrezorAction}
                        addresses={this.state.addresses}
                        t={t}
                    />
                    :
                    <ContentBox className={theme.tabBox}>
                        {this.state.waitingAddrsData ?
                            <ContentStickyTop>
                                <TopLoading msg={t('TREZOR_WAITING_ADDRS_INFO')} />
                            </ContentStickyTop>
                            :
                            this.state.waitingTrezorAction ?
                                <ContentStickyTop>
                                    <TopLoading msg={t('TREZOR_WAITING_ACTION')} />
                                </ContentStickyTop> : null
                        }

                        <ContentBody>
                            <p>
                                {t('TREZOR_INFO')}
                            </p>
                            <br />
                            <p
                                dangerouslySetInnerHTML={
                                    {
                                        __html: t('TREZOR_BASIC_USAGE_INFO',
                                            {
                                                args: [{
                                                    component:
                                                        <Anchor href='https://trezor.io/' target='_blank'> TREZOR Wallet </Anchor>
                                                }, {
                                                    component:
                                                        <Anchor href='https://wallet.trezor.io/#/bridge' target='_blank'> TREZOR Bridge </Anchor>
                                                }]
                                            })
                                    }
                                }
                            />
                            <br />
                            <h3>
                                <Anchor href='https://trezor.io' target='_blank'>
                                    <Img src={require('resources/trezor-logo-h.png')} alt={'https://trezor.io'} style={{ maxWidth: '100%', maxHeight: '72px' }} />
                                </Anchor>
                            </h3>
                            <br />
                            <br />

                            {!this.state.waitingAddrsData && !this.state.waitingTrezorAction ?
                                <Button onClick={this.connectTrezor} label={t('CONNECT_WITH_TREZOR')} raised primary />
                                : null}

                        </ContentBody>
                    </ContentBox>
                }
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
)(Translate(AuthHoc(AuthTrezor)))
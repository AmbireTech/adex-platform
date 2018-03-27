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
// import scActions from 'services/smart-contracts/actions'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'
import { addSig, getSig } from 'services/auth/auth'
// import { checkAuth } from 'services/adex-node/actions'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox } from 'react-toolbox/lib/list'
import { getAddrs } from 'services/hd-wallet/utils'
import scActions from 'services/smart-contracts/actions'
import trezorConnect from 'third-party/trezor-connect'
import { adxToFloatView } from 'services/smart-contracts/utils'
import { web3Utils } from 'services/smart-contracts/ADX'

const TrezorConnect = trezorConnect.TrezorConnect

const { getAccountStats, signAuthTokenTrezor } = scActions

const path = "m/44'/60'/0'/0";

const getAddrStatsLabel = (stats) => {
    let addrBalanceAdx = adxToFloatView(stats.balanceAdx || 0)
    let addrBalanceEth = web3Utils.fromWei(stats.balanceEth || '0', 'ether')
    let exchBal = stats.exchangeBalance || {}
    let adxOnBids = adxToFloatView(exchBal.onBids)
    let exchangeAvailable = adxToFloatView(exchBal.available)

    // TODO: translation
    return  addrBalanceEth + ' ETH, ' + addrBalanceAdx + ' ADX, on bids: ' +adxOnBids + ' ADX, exchange available: ' + exchangeAvailable + ' ADX'
}

// const RRButton = withReactRouterLink(Button)

class AuthTrezor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            method: '',
            sideSelect: false,
            addresses: [] //testAddresses
        }
    }

    connectTrezor = () => {
        TrezorConnect.getXPubKey(path, (result) => {
            if (result.success) {
                let addresses = getAddrs(result.publicKey, result.chainCode)

                let allStatsPr = []

                addresses.forEach((addr) => {
                    allStatsPr.push(getAccountStats({_addr: addr}))
                })

                Promise.all(allStatsPr)
                    .then((results) => {
                        this.setState({ addresses: results })
                    })
                
            } else {
                console.error('Error:', result)
            }
        })
    }

    AddressSelect = ({addresses, ...rest}) => {
        return (
            <List selectable ripple>
            {addresses.map((res, index) => 
                <ListItem key={res.addr} onClick={this.onAddrSelect.bind(this, res.addr, index)} caption={res.addr} legend={getAddrStatsLabel(res)}/>
            )}
            </List>
        )
    }

    authOnServer = (addr, index) => {
        let signature = null
        // let addr = this.props.account._addr
        // let authToken = 'someAuthTOken'
        let mode = EXCHANGE_CONSTANTS.SIGN_TYPES.Trezor.id // TEMP?

        signAuthTokenTrezor({ userAddr: addr, hdPAth: path, mode: mode, addrIdx: index })
            .then(({ sig, sig_mode, authToken, typedData, hashData }) => {
                signature = sig
                return signToken({ userid: addr, signature: signature, authToken: authToken, mode: mode, typedData: typedData, hashData: hashData })
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

    onAddrSelect = (addr, index) => {
        let mode = EXCHANGE_CONSTANTS.SIGN_TYPES.Trezor.id
        this.authOnServer(addr, index)
    }

    render() {
        let t = this.props.t
        // let authMode = this.props.account._authMode

        return (
            <div >
                {this.state.addresses.length ? 
                    <this.AddressSelect addresses={this.state.addresses} />
                    :
                    <div>
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
)(Translate(AuthTrezor))
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Button from '@material-ui/core/Button'
import Translate from 'components/translate/Translate'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import { getAddrs } from 'services/hd-wallet/utils'
import scActions from 'services/smart-contracts/actions'
import ledger from 'ledgerco' //'third-party/ledger.min'
import AuthHoc from './AuthHoc'
import { AUTH_TYPES } from 'constants/misc'
import { AddrItem } from './AuthCommon'
import { ContentBox, ContentBody, ContentStickyTop, TopLoading } from 'components/common/dialog/content'
import Helper from 'helpers/miscHelpers'
import LEDGER_DL_IMG from 'resources/ledger_logo_header.png'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const { getAccountStats } = scActions

const HD_PATH = "m/44'/60'/0'"

class AuthLedger extends Component {
    constructor(props) {
        super(props)
        this.state = {
            method: '',
            sideSelect: false,
            addresses: [],
            waitingLedgerAction: false,
            waitingAddrsData: false
        }
    }

    componentWillUnmount() {
    }

    connectLedger = () => {

        this.setState({ waitingLedgerAction: true }, () => {

            ledger.comm_u2f.create_async()
                .then((transport) => {
                    var eth = new ledger.eth(transport)

                    return eth.getAddress_async(HD_PATH, false, true)
                })
                .then((resp) => {
                    let addresses = getAddrs(resp.publicKey, resp.chainCode)

                    let allStatsPr = []

                    addresses.forEach((addr) => {
                        allStatsPr.push(getAccountStats({ _addr: addr, authType: AUTH_TYPES.LEDGER.name }))
                    })

                    this.setState({ waitingAddrsData: true }, () => {
                        Promise.all(allStatsPr)
                            .then((results) => {
                                this.setState({ addresses: results, waitingAddrsData: false, waitingLedgerAction: false })
                            })
                            .catch((err) => {
                                this.setState({ waitingLedgerAction: false, waitingAddrsData: false })
                                this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_LEDGER', { args: [Helper.getErrMsg(err)] }), timeout: 5000 })
                            })
                    })
                })
                .catch((err) => {
                    this.setState({ waitingLedgerAction: false, waitingAddrsData: false })
                    this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_LEDGER', { args: [Helper.getErrMsg(err)] }), timeout: 5000 })
                })
        })
    }

    AddressSelect = ({ addresses, waitingLedgerAction, t, classes, ...rest }) => {
        return (
            <ContentBox className={classes.tabBox}>
                <ContentStickyTop>
                    {waitingLedgerAction ?
                        <TopLoading msg={t('LEDGER_WAITING_ACTION')} />
                        :
                        t('SELECT_ADDR_LEDGER')
                    }
                </ContentStickyTop>
                <ContentBody>
                    <List >
                        {addresses.map((res, index) =>
                            <ListItem
                                classes={{ root: classes.addrListItem }}
                                key={res.addr}
                                onClick={this.onAddrSelect.bind(this, res.addr, index)}
                            >
                                <AddrItem stats={res} t={t} addr={res.addr} />
                            </ListItem>
                        )}
                    </List>
                </ContentBody>
            </ContentBox>
        )
    }

    onAddrSelect = (addr, index) => {
        this.setState({ waitingLedgerAction: true }, () => {
            let mode = AUTH_TYPES.LEDGER.signType // TEMP?
            let authType = AUTH_TYPES.LEDGER.name
            this.props.authOnServer({ mode, addr, authType, hdPath: HD_PATH, addrIdx: index })
                .then((res) => {
                })
                .catch((err) => {
                    console.log(err)
                    this.setState({ waitingLedgerAction: false, waitingAddrsData: false })
                    this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_LEDGER', { args: [(err || {}).error || err] }), timeout: 5000 })
                })
        })
    }

    render() {
        let { t, classes } = this.props

        return (
            <div>
                {this.state.addresses.length ?
                    <this.AddressSelect
                        waitingLedgerAction={this.state.waitingLedgerAction}
                        addresses={this.state.addresses}
                        t={t}
                        classes={classes}
                    />
                    :
                    <ContentBox className={classes.tabBox}>
                        {this.state.waitingAddrsData ?
                            <ContentStickyTop>
                                <TopLoading msg={t('LEDGER_WAITING_ADDRS_INFO')} />
                            </ContentStickyTop>
                            :
                            this.state.waitingLedgerAction ?
                                <ContentStickyTop>
                                    <TopLoading msg={t('LEDGER_WAITING_ACTION')} />
                                </ContentStickyTop> : null
                        }

                        <ContentBody>
                            <Typography paragraph variant='subheading'>
                                {t('LEDGER_INFO')}
                            </Typography>
                            <Typography paragraph>
                                <span
                                    dangerouslySetInnerHTML={
                                        {
                                            __html: t('LEDGER_BASIC_USAGE_INFO',
                                                {
                                                    args: [{
                                                        component:
                                                            <Anchor href='https://www.ledgerwallet.com/' target='_blank'> LEDGER </Anchor>
                                                    }]
                                                })
                                        }
                                    }
                                />
                            </Typography>
                            <Typography paragraph>
                                <Anchor href='https://www.ledgerwallet.com/' target='_blank'>
                                    <Img src={LEDGER_DL_IMG} alt={'https://www.ledgerwallet.com/'} className={classes.dlBtnImg} />
                                </Anchor>
                            </Typography>

                            {(!this.state.waitingAddrsData && !this.state.waitingLedgerAction) &&
                                <Button
                                    onClick={this.connectLedger}
                                    variant='raised'
                                    color='primary'
                                >
                                    {t('CONNECT_WITH_LEDGER')}
                                </Button>
                            }

                        </ContentBody>
                    </ContentBox>
                }
            </div>
        )
    }
}

AuthLedger.propTypes = {
    actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    const persist = state.persist
    // const memory = state.memory
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
)(Translate(AuthHoc(withStyles(styles)(AuthLedger))))
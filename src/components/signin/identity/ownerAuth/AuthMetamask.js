import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Button from '@material-ui/core/Button'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import Typography from '@material-ui/core/Typography'
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
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const { getAccountMetamask, getAccountBalance } = scActions

class AuthMetamask extends Component {
    constructor(props) {
        super(props)
        this.state = {
            method: '',
            sideSelect: false,
            address: {},
            waitingMetamaskAction: false,
            waitingAddrsData: false,
            addressVerified: false
        }

        this.accountInterval = null
    }

    verifySignature = () => {
        let { addr } = this.state.address
        let mode = AUTH_TYPES.METAMASK.signType // TEMP?
        let authType = AUTH_TYPES.METAMASK.name

        this.setState({ waitingMetamaskAction: true }, () =>
            this.props.verifySignature({ mode, addr, authType })
                .then(() => {
                    this.setState({ waitingMetamaskAction: false, addressVerified: true })  
                })
                .catch((err) => {
                    this.setState({ waitingMetamaskAction: false })
                    this.props.actions.addToast({ type: 'cancel', action: 'X', label: this.props.t('ERR_AUTH_METAMASK', { args: [Helper.getErrMsg(err)] }), timeout: 5000 })
                })
        )
    }

    checkMetamask = () => {
        const { t } = this.props
        const authType = AUTH_TYPES.METAMASK.name
        getAccountMetamask()
            .then(({ addr, netId }) => {
                if (!addr) {
                    this.setState({ address: {} })
                    this.props.actions.addToast({ type: 'warning', action: 'X', label: t('AUTH_WARN_NO_METAMASK_ADDR'), timeout: 5000 })
                    return null
                } else {
                    this.setState({ waitingAddrsData: true })
                    return getAccountBalance({ _addr: addr, authType })
                }
            })
            .then((stats) => {
                this.setState({ address: stats || {}, waitingAddrsData: false, })
            })
            .catch((err) => {
                this.props.actions.addToast({ type: 'cancel', action: 'X', label: t('AUTH_ERR_METAMASK', { args: [Helper.getErrMsg(err)] }), timeout: 5000 })
                this.setState({ waitingAddrsData: false, address: {} })
            })
    }

    render() {
        const { t, classes } = this.props
        const { addressVerified, address } = this.state
        const stats = this.state.address
        const userAddr = stats.addr

        return (
            <ContentBox className={classes.tabBox} >
                {this.state.waitingMetamaskAction ?
                    <ContentStickyTop>
                        <TopLoading msg={t('METAMASK_WAITING_ACTION')} />
                    </ContentStickyTop>
                    : this.state.waitingAddrsData ?
                        <TopLoading msg={t('METAMASK_WAITING_ADDR_INFO')} />
                        : null
                }
                <ContentBody>
                    <Typography paragraph variant='subheading'>
                        {t('METAMASK_INFO')}
                    </Typography>
                    <Typography paragraph>
                        <span
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
                    </Typography>
                    <Typography paragraph>
                        <Anchor href='https://metamask.io/' target='_blank'>
                            <Img src={METAMASK_DL_IMG} alt={'Downlad metamask'} className={classes.dlBtnImg} />
                        </Anchor>
                    </Typography>
                    {userAddr ?
                        addressVerified ?
                            <Typography paragraph variant='subheading'>
                                {t('METAMASK_CONTINUET_TO_NEXT_STEP')}
                            </Typography>
                            :
                            <div>
                                <div className={classes.metamaskLAbel}>
                                    {stats ?
                                        <AddrItem stats={stats} t={t} addr={userAddr} />
                                        : t('AUTH_WITH_METAMASK_LABEL', { args: [userAddr] })
                                    }

                                </div>
                                <Button
                                    onClick={this.verifySignature}
                                    variant='raised'
                                    color='secondary'
                                    disabled={this.state.waitingMetamaskAction}
                                >
                                    {this.state.waitingMetamaskAction && <HourglassEmptyIcon className={classes.leftBtnIcon} />}
                                    {t('AUTH_WITH_METAMASK_BTN', { args: [userAddr] })}
                                </Button>
                            </div>

                        :

                        <Button
                            onClick={this.checkMetamask}
                            variant='raised'
                            color='primary'
                            disabled={this.state.waitingAddrsData}
                        >
                            {t('AUTH_CONNECT_WITH_METAMASK')}
                        </Button>

                    }
                </ContentBody>
            </ContentBox>
        )
    }
}

AuthMetamask.propTypes = {
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
)(Translate(AuthHoc(withStyles(styles)(AuthMetamask))))
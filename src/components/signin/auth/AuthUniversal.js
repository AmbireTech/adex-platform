import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import AuthHoc from './AuthHoc'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { ContentBox, ContentBody } from 'components/common/dialog/content'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { AUTH_TYPES } from 'constants/misc'
import { getAccount, sigDemoMsg } from 'services/demo-account/demo-account'
import { signToken } from 'services/adex-node/actions'
import EthereumIdentitySDK from 'universal-login-monorepo/universal-login-sdk'
import { ethers, Wallet } from 'ethers'
import { Input } from '@material-ui/core'
import { getWeb3 } from 'services/smart-contracts/ADX'
import { testrpcCfg } from 'services/smart-contracts/ADXTestrpcCfg'

class AuthUniversal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            username: ''
        }

        this.provider = new ethers.providers.JsonRpcProvider(testrpcCfg.node) // not sure if needed
        this.sdk = new EthereumIdentitySDK('http://localhost:3311', this.provider)
    }

    getAcc() {
        return getWeb3('universal')
            .then(({ web3 }) => {
                return web3.eth.accounts.create()
            })
    }

    async componentDidMount() {
        await this.sdk.start()
    }

    componentWillUnmount() {
        this.subscription ? this.subscription.remove() : null
        this.sdk.stop()
    }

    async connect(username) {
        const name = `${username}.mylogin.eth`
        const identityAddress = await this.sdk.identityExist(name)
        this.identityAddress = identityAddress
        if (identityAddress ) {
            const privateKey = await this.sdk.connect(identityAddress)
            this.privateKey = privateKey
            const { address } = new Wallet(privateKey)
            this.subscription = this.sdk.subscribe('KeyAdded', identityAddress, (event) => {
                if (event.address === address) {
                    console.log('CONNECTED!!!')
                }
            })
        } else {
            await this.create(username)
        }
    }

    async create(username) {
        // has keys firstPrivateKey, identityAddress
        const response  = await this.sdk.create(
            `${username}.ethereum.eth`
        )
    }

    authOnServer = () => {
        const authToken = 'demo signature'
        let mode = AUTH_TYPES.DEMO.signType
        let authType = AUTH_TYPES.DEMO.name
        let addr = null
        let signature = null

        getAccount()
            .then((account) => {
                addr = account.address
                return sigDemoMsg({ msg: authToken, account })
            })
            .then(sig => {
                signature = sig.sig
                return signToken({ userid: addr, signature: signature.signature, authToken, mode: mode, hash: sig.hash, })
            })
            .then(res => {
                return this.props.updateAcc({ res, addr, signature: signature.signature, mode, authType })
            })
    }

    async onSubmit() {
        await this.connect(this.state.username)
    }

    onInputChange(username) {
        this.setState({username})
    }

    render() {
        const { t, classes } = this.props
        return (
            <ContentBox className={classes.tabBox} >
                <ContentBody>
                    <Typography paragraph variant='subheading'>
                        {t('UNIVERSAL_DESCRIPTION')}
                    </Typography>
                    <Input
                        onChange={(event) => this.onInputChange(event.target.value)}
                        placeholder="e.g. pencho"
                        value={this.state.username}
                    />
                    <br/>
                    <br/>
                    <Button
                        onClick={this.onSubmit.bind(this)}
                        variant='raised'
                        color='primary'
                    >
                        {t('UNIVERSAL_AUTH')}
                    </Button>
                </ContentBody>
            </ContentBox>
        )
    }
}

AuthUniversal.propTypes = {
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
)(Translate(AuthHoc(withStyles(styles)(AuthUniversal))))
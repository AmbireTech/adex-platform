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
import { getAccount, sigMsg } from 'services/universal-login/universal-login'
import { signToken } from 'services/adex-node/actions'
import EthereumIdentitySDK from 'universal-login-monorepo/universal-login-sdk'
import { ethers } from 'ethers'
import { Input } from '@material-ui/core'
import { getWeb3 } from 'services/smart-contracts/ADX'

class AuthUniversal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            username: ''
        }

        this.provider = new ethers.providers.JsonRpcProvider('http://localhost:18545')
        this.sdk = new EthereumIdentitySDK('http://localhost:3311', this.provider)
        this.ensDomain = 'mylogin'
    }

    getAcc() {
        return getWeb3('universal')
            .then(({ web3 }) => {
                return web3.eth.accounts.create()
            })
    }

    componentDidMount() {
        this.sdk.start()
    }

    componentWillUnmount() {
        this.subscription ? this.subscription.remove() : null
        this.sdk.stop()
    }

    connectToSdk(username) {
        const name = `${username}.${this.ensDomain}.eth`
        this.sdk.identityExist(username)
            .then((identityAddress) => {
                this.identityAddress = identityAddress
                if (identityAddress) {
                    console.log('Identity Adress Exists!', identityAddress)
                    const privateKey = this.sdk.connect(identityAddress)
                    setTimeout(() => {console.log(privateKey)}, 10000)
                        // .then(privateKey => {
                            // console.log(privateKey)
                            // this.privateKey = privateKey
                            // const { address } = new Wallet(privateKey)
                            // this.subscription = this.sdk.subscribe('KeyAdded', identityAddress, (event) => {
                            //     if (event.address === address) {
                            //         console.log('CONNECTED!!!')
                            //     }
                            // })
                        // })
                } else {
                    this.create(name)
                        .then(res => {
                            console.log(res)
                            const privateKey = res[0]
                            const address = res[1]
                            this.authOnServer({privateKey, address, name});
                        })
                        .catch((err) => {
                            console.error(err)
                        })
                }
            })
            .catch(err => console.error(err))
    }

    create(name) {
        // has keys firstPrivateKey, identityAddress
        return this.sdk.create(name)
    }

    authOnServer = ({privateKey, address, name}) => {
        const authToken = 'UNIVERSAL'
        let mode = AUTH_TYPES.UNIVERSAL.signType
        let authType = AUTH_TYPES.UNIVERSAL.name
        let addr = null
        let signature = null
        getAccount({privateKey, address})
            .then(account => {
                addr = account.address
                return sigMsg({ msg: authToken, account })
            })
            .then(sig => {
                signature = sig.sig
                return signToken({ userid: addr, signature: signature.signature, authToken, mode: mode, hash: sig.hash, })
            })
            .then(res => {
                return this.props.updateAcc({ res, addr, signature: signature.signature, mode, authType, name })
            })
    }

    onSubmit() {
        this.connectToSdk(this.state.username)
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
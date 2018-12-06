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
import EthereumIdentitySDK from 'universal-login-monorepo/universal-login-sdk'
import { ethers, Wallet } from 'ethers'
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

    checkEnsValidity(username) {
        return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]$/.test(username)
    }

    connectToSdk(username) {
        const { t } = this.props;
        if (!this.checkEnsValidity(username)) {
            this.props.actions
                .addToast({ type: 'accept', action: 'X', label: t('BAD_ENS_USERNAME'), timeout: 5000 })
            return;
        }

        let name = `${username}.${this.ensDomain}.eth`
        name = name.toLowerCase(); // sdk throws error for uppercase

        this.sdk.identityExist(name)
            .then((identityAddress) => {
                this.identityAddress = identityAddress
                if (identityAddress) {
                    this.sdk.connect(identityAddress)
                        .then(privateKey => {
                            this.privateKey = privateKey
                            const { address } = new Wallet(privateKey)
                            this.subscription = this.sdk.subscribe('KeyAdded', identityAddress, (event) => {
                                if (event.address === address) {
                                    console.log('CONNECTED!!!')
                                }
                            })
                        })
                } else {
                    this.create(name)
                        .then(res => {
                            console.table({privateKey: res[0], address: res[1]})
                            const privateKey = res[0]
                            const addr = res[1]
                            this.authOnServer({privateKey, addr, name});
                        })
                        .catch((err) => {
                            console.error('Or here', err)
                        })
                }
            })
            .catch(err => console.error('Breaks here', err))
    }

    create(name) {
        // has keys firstPrivateKey, identityAddress
        return this.sdk.create(name)
    }

    authOnServer = ({privateKey, addr, name}) => {
        let mode = AUTH_TYPES.UNIVERSAL.signType
        let authType = AUTH_TYPES.UNIVERSAL.name

        this.props.authOnServer({addr, mode, authType, name})
            .then((res) => {
                console.log('PASSED', res)
            })
            .catch((err) => {
                console.error(err)
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
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Route, Switch, Redirect } from 'react-router-dom'
import Dashboard from 'components/dashboard/dashboard/Dashboard'
import SigninExternalWallet from 'components/signin/SigninExternalWallet'
import PageNotFound from 'components/page_not_found/PageNotFound'
import Translate from 'components/translate/Translate'
import scActions from 'services/smart-contracts/actions'
import { getSig } from 'services/auth/auth'
import { AUTH_TYPES } from 'constants/misc'
import { logOut } from 'services/store-data/auth'

const { getAccountMetamask } = scActions

function PrivateRoute({ component: Component, auth, ...other }) {
    return (
        <Route
            {...other}
            render={(props) => auth === true //|| true
                ? <Component {...props} />
                : <Redirect to={{ pathname: '/', state: { from: props.location } }} />}
        />
    )
}

class Root extends Component {

    constructor(props) {
        super(props)
        this.accountInterval = null
    }

    checkForMetamaskAccountChange = () => {
        let acc = this.props.account
        if (acc._authType === AUTH_TYPES.METAMASK.name) {

            getAccountMetamask()
                .then(({ addr, mode }) => {
                    addr = (addr || '').toLowerCase()
                    if (addr && acc._addr && acc._authType !== undefined) {
                        let accSigCheck = getSig({ addr: acc._addr, mode: acc._authType })
                        let mmAddrSigCheck = getSig({ addr: addr, mode: AUTH_TYPES.METAMASK.name })
                        if (!!mmAddrSigCheck && !!accSigCheck && (mmAddrSigCheck === accSigCheck)) {
                            return // user authenticated and not changed
                        } else {
                            // logout on metamask addr change
                            logOut()
                        }
                    } else {
                        logOut()
                    }
                })
        }
    }

    componentWillMount() {
        this.checkForMetamaskAccountChange()

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('acc changed', accounts[0])
                this.checkForMetamaskAccountChange()
            })
        }
    }

    render() {
        return (
            <Switch >
                <PrivateRoute auth={this.props.auth} path="/dashboard/:side" component={Dashboard} />
                <Route exact path="/" component={SigninExternalWallet} />
                <Route component={PageNotFound} />
            </Switch >
        )
    }
}

Root.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    let account = persist.account
    // let memory = state.memory
    return {
        account: account,
        auth: !!account._addr && !!account._authSig && account._authType !== undefined
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
)(Translate(Root))


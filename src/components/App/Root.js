import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Route, Switch, Redirect } from 'react-router-dom'
import Dashboard from 'components/dashboard/Dashboard'
import SigninMetamask from 'components/signin/SigninMetamask'
import PageNotFound from 'components/page_not_found/PageNotFound'
import Translate from 'components/translate/Translate'
import { web3, getWeb3 } from 'services/smart-contracts/ADX'
import scActions from 'services/smart-contracts/actions'

const { setWallet, getAccountStats, getAccountStatsMetaMask } = scActions

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

    componentWillMount() {
        getWeb3.then(({ web32 }) => {

            web32.eth.getAccounts((err, accounts) => {
                let user = accounts[0]

                if (err || !user) {
                    console.log('accounts[0] no', user)
                    this.props.actions.resetAccount()
                } else {
                    console.log('accounts[0]', user)

                    if (user) {
                        this.props.actions.updateAccount({ ownProps: { _temp: { addr: user } } })

                        getAccountStatsMetaMask({})
                            .then((stats) => {
                                this.props.actions.updateAccount({ ownProps: { stats: stats } })
                            })
                    }
                }
            })
        })
    }

    render() {
        console.log('this.props.match.params', this.props.match)
        return (
            <Switch >
                <PrivateRoute auth={this.props.auth} path="/dashboard/:side" component={Dashboard} />
                <Route exact path="/" component={SigninMetamask} />
                <Route component={PageNotFound} />
            </Switch>
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
        auth: !!account._temp && !!account._temp.addr // !!memory.signin.publicKey
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


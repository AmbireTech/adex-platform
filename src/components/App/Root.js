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

const { getAccount, getAccountStats, getAccountStatsMetaMask } = scActions

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

    setAccount = () => {
        getAccount()
            .then((addr) => {

                if (addr) {
                    this.props.actions.updateAccount({ ownProps: { addr: addr } })
                    getAccountStatsMetaMask({})
                        .then((stats) => {
                            this.props.actions.updateAccount({ ownProps: { stats: stats } })
                        })
                } else {
                    this.props.actions.resetAccount()
                }
            })
    }

    componentWillMount() {
        this.setAccount()
    }

    // NOTE: On location we check the metamsk user instead as metamask defaut setInterval way
    // NOTE: On the signin page there will be button to signin manually if you are logged to metamsk
    // TODO: We may need to use setInterval in order to detect metamask account change
    componentWillUpdate(nextProps) {
        if (nextProps.location && nextProps.location.key && (nextProps.location.key !== this.props.location.key)) {
            this.setAccount()
        }
    }

    render() {
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
        auth: !!account._addr
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


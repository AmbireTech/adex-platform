import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Route, Switch, Redirect } from 'react-router-dom'
import Dashboard from 'components/dashboard/Dashboard'
import Signin from 'components/signin/Signin'
import PageNotFound from 'components/page_not_found/PageNotFound'
import Toast from 'components/toast/Toast'
import Confirm from 'components/confirm/Confirm'
import Translate from 'components/translate/Translate'
import { web3, getWeb3 } from 'services/smart-contracts/ADX'
import scActions from 'services/smart-contracts/actions'

const { setWallet, getAccountStats, getAccountStatsMetaMask } = scActions

class Root extends Component {

    componentWillMount() {
        getWeb3.then(({ web32 }) => {

            web32.eth.getAccounts((err, accounts) => {
                if (err || !accounts[0]) {
                    console.log('accounts[0]', accounts[0])
                    this.props.actions.resetAccount()
                } else {

                    let account = web3.eth.accounts[0]

                    console.log('account', account)
                    console.log('accounts[0]', accounts[0])

                    this.props.actions.updateAccount({ ownProps: { _temp: { addr: accounts[0] } } })

                    getAccountStatsMetaMask({})
                        .then((stats) => {
                            this.props.actions.updateAccount({ ownProps: { stats: stats } })
                        })

                }
            })
        })
    }

    render() {
        return (
            <div >
                <Route path="/dashboard/:side" component={Dashboard} />
                <Redirect from="/dashboard" to="/side-select" />
                <Route path="/" component={Signin} />
                <Route component={PageNotFound} />
            </div>
        )
    }
}

Root.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
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


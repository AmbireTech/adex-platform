import React from 'react'
import theme from './theme.css'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import { web3Utils } from 'services/smart-contracts/ADX'
import { MULT } from 'services/smart-contracts/constants'
import { WithdrawEth, WithdrawAdx, Deposit, WithdrawFromExchange } from 'components/dashboard/forms/web3/transactions'
import { List, ListItem, ListDivider } from 'react-toolbox/lib/list'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import { Button } from 'react-toolbox/lib/button'
import scActions from 'services/smart-contracts/actions'

const { getAccountStats, getAccountStatsMetaMask } = scActions
const RRButton = withReactRouterLink(Button)

class Account extends React.Component {

    componentWillMount(nextProps) {
        this.getStats()
    }

    getStats = () => {
        // TODO: spinner
        /*getAccountStats*/ getAccountStatsMetaMask({ _addr: this.props.account._addr })
            .then((stats) => {
                this.props.actions.updateAccount({ ownProps: { stats: stats } })
            })
    }

    onSave = () => {
        this.getStats()
    }

    render() {
        let account = this.props.account
        let stats = { ...account._stats } || {}
        let t = this.props.t
        // TODO: save precision; now the values are strings so fix that too
        let addrBalanceAdx = ((stats.balanceAdx || 0) / MULT)
        let addrBalanceEth = web3Utils.fromWei(stats.balanceEth || '0', 'ether')
        let exchBal = stats.exchangeBalance || {}
        let adxOnExchangeTotal = exchBal.total / MULT
        let adxOnBids = exchBal.onBids / MULT
        let exchangeAvailable = exchBal.available / MULT


        return (
            <div>
                <List selectable={false} ripple={false}>
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ETH_ADDR')}
                        caption={account._addr}
                        // TODO: add copy to clipboard btn for the address
                        // rightIcon='content_copy'
                        // leftIcon='compare_arrows'
                        theme={theme}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ETH_BALANCE')}
                        caption={addrBalanceEth}
                        // leftIcon='euro_symbol'
                        theme={theme}
                        rightIcon={<WithdrawEth
                            icon=''
                            // raised
                            primary
                            onSave={this.onSave}
                        />}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ADX_BALANCE')}
                        caption={addrBalanceAdx + ''}
                        // leftIcon='text_format'
                        theme={theme}
                        rightIcon={<WithdrawAdx
                            icon=''
                            // raised
                            primary
                            onSave={this.onSave}
                        />}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('EXCHANGE_ADX_BALANCE_AVAILABLE')}
                        caption={exchangeAvailable + ''}
                        // leftIcon='text_format'
                        theme={theme}
                        rightIcon={
                            <span>
                                <Deposit
                                    icon=''
                                    // raised
                                    accent
                                    onSave={this.onSave}
                                    addrBalanceAdx={addrBalanceAdx}
                                />
                                <WithdrawFromExchange
                                    icon=''
                                    // raised
                                    primary
                                    onSave={this.onSave}
                                    exchangeAvailable={exchangeAvailable}
                                />
                            </span>}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('EXCHANGE_ADX_BALANCE_ON_BIDS')}
                        caption={adxOnBids + ''}
                        // leftIcon='text_format'
                        theme={theme}
                        rightIcon={<RRButton
                            to={`/dashboard/${this.props.side}/accepted-bids`}
                            // TODO: Make this page
                            label={t('GO_TO_ACCEPTED_BIDS')}
                        />}
                    />
                    <ListDivider />
                </List>
            </div>
        )
    }
}

Account.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    let account = persist.account
    return {
        account: account,
        side: memory.nav.side,
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
)(Translate(Account))

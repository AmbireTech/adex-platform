import React from 'react'
import theme from './theme.css'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import { web3Utils } from 'services/smart-contracts/ADX'
import { WithdrawEth, WithdrawAdx, Deposit, WithdrawFromExchange } from 'components/dashboard/forms/web3/transactions'
import { List, ListItem, ListDivider } from 'react-toolbox/lib/list'
import { adxToFloatView } from 'services/smart-contracts/utils'
import scActions from 'services/smart-contracts/actions'

const { getAccountStatsMetaMask } = scActions
// const RRButton = withReactRouterLink(Button)

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
        let addrBalanceAdx = adxToFloatView(stats.balanceAdx || 0)
        let addrBalanceEth = web3Utils.fromWei(stats.balanceEth || '0', 'ether')
        let exchBal = stats.exchangeBalance || {}
        // let adxOnExchangeTotal = adxToFloatView(exchBal.total)
        let adxOnBids = adxToFloatView(exchBal.onBids)
        let exchangeAvailable = adxToFloatView(exchBal.available)

        return (
            <div>
                <List selectable={false} ripple={false}>
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ETH_ADDR')}
                        caption={account._addr}
                        // TODO: add copy to clipboard btn for the address
                        // rightIcon='content_copy'
                        theme={theme}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ETH_BALANCE')}
                        caption={addrBalanceEth + ' ETH'}
                        theme={theme}
                        rightIcon={<WithdrawEth
                            icon=''
                            raised
                            primary
                            onSave={this.onSave}
                            availableAmount={addrBalanceEth}
                            tokenName='ETH'
                            accAddr={account._addr}
                            className={theme.actionBtn}
                        />}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ADX_BALANCE')}
                        caption={addrBalanceAdx + ' ADX'}
                        theme={theme}
                        rightIcon={<WithdrawAdx
                            icon=''
                            raised
                            primary
                            onSave={this.onSave}
                            availableAmount={addrBalanceAdx}
                            tokenName='ADX'
                            accAddr={account._addr}
                            className={theme.actionBtn}
                        />}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('EXCHANGE_ADX_BALANCE_AVAILABLE')}
                        caption={exchangeAvailable + ' ADX'}
                        theme={theme}
                        rightIcon={
                            <span>
                                <Deposit
                                    icon=''
                                    raised
                                    accent
                                    onSave={this.onSave}
                                    addrBalanceAdx={addrBalanceAdx}
                                    className={theme.actionBtn}
                                />
                                <WithdrawFromExchange
                                    icon=''
                                    raised
                                    primary
                                    onSave={this.onSave}
                                    exchangeAvailable={exchangeAvailable}
                                    className={theme.actionBtn}
                                />
                            </span>}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('EXCHANGE_ADX_BALANCE_ON_BIDS')}
                        caption={adxOnBids + ' ADX'}
                        theme={theme}
                    // rightIcon={<RRButton
                    //     to={`/dashboard/${this.props.side}/accepted-bids`}
                    //     // TODO: Make this page
                    //     label={t('GO_TO_ACCEPTED_BIDS')}
                    // />}
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

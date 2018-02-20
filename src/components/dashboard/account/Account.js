import React from 'react'
import theme from './theme.css'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import moment from 'moment'
// import { Button, IconButton } from 'react-toolbox/lib/button'
import Translate from 'components/translate/Translate'
// import Img from 'components/common/img/Img'
import { web3Utils } from 'services/smart-contracts/ADX'
import { MULT } from 'services/smart-contracts/constants'
// import NewItemWithDialog from 'components/dashboard/forms/NewItemWithDialog'
// import Input from 'react-toolbox/lib/input'
import { WithdrawEth, WithdrawAdx, Deposit, WithdrawFromExchange } from 'components/dashboard/forms/web3/transactions'
import { List, ListItem, ListSubHeader, ListDivider } from 'react-toolbox/lib/list'

import scActions from 'services/smart-contracts/actions'
const { getAccountStats, getAccountStatsMetaMask } = scActions

// console.log('actions', actions)
class Account extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            allowance: 0
        }

        this.subscription = null
        this.syncing = null
        this.logs = null
    }

    componentWillMount(nextProps) {
        this.getStats()
    }

    componentWillUnmount() {
        // web3.eth.clearSubscriptions()
    }

    getStats = () => {
        // TODO: spinner
        /*getAccountStats*/ getAccountStatsMetaMask({ _addr: this.props.account._addr })
            .then((stats) => {
                this.props.actions.updateAccount({ ownProps: { stats: stats } })
            })
    }

    stats = () => {

    }

    register = () => {

    }

    onSave = () => {
        this.getStats()
    }

    render() {
        let account = this.props.account
        let stats = { ...account._stats } || {}
        let t = this.props.t
        // TODO: save precision; now the values are strings so fix that too
        let allowance = ((stats.allowance || 0) / MULT) + ''
        let exchBal = stats.exchangeBalance || {}
        let adxOnExchangeTotal = exchBal.total / MULT
        let adxOnBids = exchBal.onBids / MULT
        let exchangeAvailable = exchBal.available / MULT

        // TODO: add copy to clipboard btn for the address
        return (
            <div>
                <List selectable={false} ripple={false}>
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ETH_ADDR')}
                        caption={account._addr}
                        rightIcon='content_copy'
                        // leftIcon='compare_arrows'
                        theme={theme}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ETH_BALANCE')}
                        caption={web3Utils.fromWei(stats.balanceEth || '0', 'ether')}
                        rightIcon={<WithdrawEth icon='' raised primary onSave={this.onSave} />}
                        // leftIcon='euro_symbol'
                        theme={theme}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ADX_BALANCE')}
                        caption={((stats.balanceAdx || 0) / MULT) + ''}
                        rightIcon={<WithdrawAdx icon='' raised primary onSave={this.onSave} />}
                        // leftIcon='text_format'
                        theme={theme}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('EXCHANGE_ADX_BALANCE_AVAILABLE')}
                        caption={exchangeAvailable + ''}
                        // leftIcon='text_format'
                        theme={theme}
                        rightIcon={<Deposit
                            icon=''
                            raised
                            accent
                            onSave={this.onSave}
                            exchangeAvailable={exchangeAvailable}
                        />}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('EXCHANGE_ADX_BALANCE_ON_BIDS')}
                        caption={adxOnBids + ''}
                        // leftIcon='text_format'
                        theme={theme}
                        rightIcon={<WithdrawFromExchange
                            icon=''
                            raised
                            primary
                            onSave={this.onSave}
                            exchangeAvailable={exchangeAvailable}
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
    // let memory = state.memory
    let account = persist.account
    return {
        account: account
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

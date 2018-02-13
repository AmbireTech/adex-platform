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
import { Authenticate, Approve, WithdrawEth, WithdrawAdx, Deposit } from 'components/dashboard/forms/web3/transactions'
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
        let stats = account._stats || {}
        let t = this.props.t
        let allowance = ((stats.allowance || 0) / MULT) + ''
        stats.exchangeBalance = stats.exchangeBalance || {}

        if (!stats) {
            return null
        }

        return (
            <div>
                <List selectable={false} ripple={false}>
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_NAME')}
                        caption={stats.acc ? stats.acc._name : 'No name'}
                        rightIcon={<Authenticate icon='' raised accent onSave={this.onSave} />}
                        // leftIcon='account_box'
                        theme={theme}
                    />
                    <ListDivider />
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
                        legend={t('EXCHANHE_ADX_BALANCE_AVAILABLE')}
                        caption={((stats.exchangeBalance[0] || 0) / MULT) + ''}
                        rightIcon={<Deposit icon='' raised accent onSave={this.onSave} />}
                        // leftIcon='text_format'
                        theme={theme}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ADX_BALANCE_ON_BIDS')}
                        caption={((stats.exchangeBalance[1] || 0) / MULT) + ''}
                        rightIcon={<WithdrawAdx icon='' raised primary onSave={this.onSave} />}
                        // leftIcon='text_format'
                        theme={theme}
                    />
                    <ListDivider />
                    <ListItem
                        ripple={false}
                        legend={t('ACCOUNT_ADX_ALLOWANCE')}
                        caption={allowance}
                        rightIcon={<Approve
                            icon=''
                            raised
                            accent
                            onSave={this.onSave}
                            currentAllowance={allowance}
                            previewMsgs={[t('ACCOUNT_APPROVE_MSG', { args: [allowance] })]}
                        />
                        }
                        // leftIcon='check'
                        theme={theme}
                    />

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

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import { WithdrawEth, WithdrawAdx, Deposit, WithdrawFromExchange } from 'components/dashboard/forms/web3/transactions'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import { styles } from './styles.js'
import { getStatsValues } from 'helpers/accStatsHelpers'
import scActions from 'services/smart-contracts/actions'
import AirSwap from 'components/dashboard/forms/AirSwap'

const { getAccountStats } = scActions
// const RRButton = withReactRouterLink(Button)

class Account extends React.Component {

    componentWillMount() {
        this.props.actions.updateNav('navTitle', this.props.t('ACCOUNT'))
        this.getStats()
    }

    getStats = () => {
        // TODO: spinner
        /*getAccountStats*/ getAccountStats({ _addr: this.props.account._addr, authType: this.props.account._authMode.authType })
            .then((stats) => {
                this.props.actions.updateAccount({ ownProps: { stats: stats } })
            })
    }

    onSave = () => {
        this.getStats()
    }

    render() {
        const { t, account, classes } = this.props
        const stats = { ...account._stats }

        const {
            addrBalanceAdx,
            addrBalanceEth,
            adxOnBids,
            exchangeAvailable
        } = getStatsValues(stats)

        return (
            <div>
                <List
                // dense={true}
                >
                    <ListItem
                    // // TODO: add copy to clipboard btn for the address
                    // // rightIcon='content_copy'
                    >
                        <ListItemText
                            primary={account._addr}
                            secondary={t('ACCOUNT_ETH_ADDR')}
                        />
                    </ListItem>
                    <ListDivider />
                    <ListItem
                    >
                        <ListItemText
                            primary={addrBalanceEth + ' ETH'}
                            secondary={t('ACCOUNT_ETH_BALANCE')}
                        />
                        <div className={classes.itemActions}>
                            <WithdrawEth
                                varint='raised'
                                color='primary'
                                onSave={this.onSave}
                                availableAmount={addrBalanceEth}
                                tokenName='ETH'
                                accAddr={account._addr}
                                className={classes.actionBtn}
                                size='small'
                            />
                        </div>
                    </ListItem>
                    <ListDivider />
                    <ListItem
                    >
                        <ListItemText
                            primary={addrBalanceAdx + ' ADX'}
                            secondary={t('ACCOUNT_ADX_BALANCE')}
                        />
                        <div className={classes.itemActions}>
                            <WithdrawAdx
                                varint='raised'
                                color='primary'
                                onSave={this.onSave}
                                availableAmount={addrBalanceAdx}
                                tokenName='ADX'
                                accAddr={account._addr}
                                className={classes.actionBtn}
                                size='small'
                            />
                            <AirSwap />
                        </div>
                    </ListItem>
                    <ListDivider />
                    <ListItem
                    >
                        <ListItemText
                            primary={exchangeAvailable + ' ADX'}
                            secondary={t('EXCHANGE_ADX_BALANCE_AVAILABLE')}
                        />
                        <div className={classes.itemActions}>
                            <Deposit
                                variant='raised'
                                color='secondary'
                                onSave={this.onSave}
                                addrBalanceAdx={addrBalanceAdx}
                                className={classes.actionBtn}
                                size='small'
                            />
                            <WithdrawFromExchange
                                variant='raised'
                                color='primary'
                                onSave={this.onSave}
                                exchangeAvailable={exchangeAvailable}
                                className={classes.actionBtn}
                                size='small'
                            />
                        </div>
                    </ListItem>
                    <ListDivider />
                    <ListItem

                    >
                        <ListItemText
                            primary={adxOnBids + ' ADX'}
                            secondary={t('EXCHANGE_ADX_BALANCE_ON_BIDS')}
                        />
                        {/* <div className={classes.itemActions}>
                            <RRButton
                                to={`/dashboard/${this.props.side}/accepted-bids`}
                                // TODO: Make this page
                                label={t('GO_TO_ACCEPTED_BIDS')}
                            />
                        </div> */}
                    </ListItem>
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
    const { persist, memory } = state
    const account = persist.account

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
)(withStyles(styles)(Translate(Account)))

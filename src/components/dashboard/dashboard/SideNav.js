import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import Icon from '@material-ui/core/Icon'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import ChannelIcon from 'components/common/icons/ChannelIcon'
import Translate from 'components/translate/Translate'
import { NewUnitDialog, NewCampaignDialog, NewSlotDialog, NewChannelDialog } from 'components/dashboard/forms/items/NewItems'
import classnames from 'classnames'
import packageJson from './../../../../package.json'
import Anchor from 'components/common/anchor/anchor'
import BidIcon from 'components/common/icons/BidIcon'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
// import GasPrice from 'components/dashboard/account/GasPrice'
import { SideSwitch } from './SideSwitch'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import DashboardIcon from '@material-ui/icons/Dashboard'
import SwapHorizontalIcon from '@material-ui/icons/SwapHoriz'
import Badge from '@material-ui/core/Badge'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import AccountBoxIcon from '@material-ui/icons/AccountBox'

const RRListItem = withReactRouterLink(ListItem)

class SideNav extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        let langChanged = this.props.language !== nextProps.language
        let sideChanged = this.props.side !== nextProps.side
        let locationChanged = this.props.location.pathname !== nextProps.location.pathname
        let transactionsChanged = (this.props.transactions.pendingTxs || []).length !== (nextProps.transactions.pendingTxs || []).length
        let bidsAwaitingActionChanged = this.bidsAwaitingActionCount !== nextProps.bidsAwaitingActionCount
        return langChanged || sideChanged || locationChanged || transactionsChanged || bidsAwaitingActionChanged
    }

    render() {
        const side = this.props.side
        if (side !== 'advertiser' && side !== 'publisher') {
            return null
        }

        // TODO: test location
        const location = this.props.location.pathname.split('/')[3]
        const isAdvertiser = side === 'advertiser'
        const collection = (isAdvertiser ? 'campaigns' : 'channels')
        const items = (isAdvertiser ? 'units' : 'slots')
        const NewCollectionBtn = (isAdvertiser ? NewCampaignDialog : NewChannelDialog)
        const NewItemBtn = (isAdvertiser ? NewUnitDialog : NewSlotDialog)
        const CollectionIcon = (isAdvertiser ? <CampaignIcon /> : <ChannelIcon />)
        const itemsIcon = (isAdvertiser ? 'format_list_bulleted' : 'format_list_bulleted')
        const t = this.props.t
        const pendingTrsCount = (this.props.transactions.pendingTxs || []).length
        const bidsAwaitingActionCount = this.props.bidsAwaitingActionCount
        const classes = this.props.classes

        return (
            <div
                className={classes.navigation}
            >
                <List
                    classes={{
                        padding: classes.sntPadding,
                        root: classes.navListRoot
                    }}
                    className={classes.navList}
                    component='nav'
                >
                    <div>
                        <div
                            className={classnames(classes.toolbar, classes.sideNavToolbar)}
                        >
                            <ListItem>
                                <AdexIconTxt
                                    className={classes.icon}
                                />
                            </ListItem>
                            <SideSwitch
                                side={side}
                                t={this.props.t}
                            />
                        </div>
                        <ListDivider />
                        <RRListItem
                            button
                            to={{ pathname: '/dashboard/' + side }}
                            className={classnames({ [classes.active]: location === '' })}
                        >
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText inset primary={t('DASHBOARD')} />
                        </RRListItem>
                        <ListDivider
                        />
                        <RRListItem
                            button
                            to={{ pathname: '/dashboard/' + side + '/' + collection }}
                            className={classnames({ [classes.active]: location === collection })}
                        >
                            <ListItemIcon>
                                {CollectionIcon}
                            </ListItemIcon>
                            <ListItemText inset primary={t(collection.toUpperCase())} />
                        </RRListItem>
                        <ListItem
                            className={classes.newItemBtn}
                        >
                            <NewCollectionBtn
                                className={classes.newItemBtn}
                                color='primary'
                                variant='raised'
                            // btnClasses={classes.newItemBtn}
                            />
                        </ListItem>
                        <ListDivider />
                        <RRListItem
                            button
                            to={{ pathname: '/dashboard/' + side + '/' + items }}
                            className={classnames({ [classes.active]: location === items })}
                        >
                            <ListItemIcon>
                                <Icon>{itemsIcon}</Icon>
                            </ListItemIcon>
                            <ListItemText inset primary={t(items.toUpperCase())} />
                        </RRListItem>
                        <ListItem
                            className={classes.newItemBtn}
                        >
                            <NewItemBtn
                                className={classes.newItemBtn}
                                color='primary'
                                variant='raised'
                            />
                        </ListItem>
                        <ListDivider
                        />
                        <RRListItem
                            button
                            to={{ pathname: '/dashboard/' + side + '/bids' }}
                            className={classnames({ [classes.active]: location === 'bids' })}
                        >
                            <ListItemIcon>
                                <span>
                                    {bidsAwaitingActionCount > 0 ?
                                        <Badge
                                            badgeContent={bidsAwaitingActionCount <= 9 ? bidsAwaitingActionCount : '9+'}
                                            color="primary"
                                        >
                                            <BidIcon />
                                        </Badge> : <BidIcon />}
                                </span>
                            </ListItemIcon>
                            <ListItemText inset primary={t('BIDS')} />
                        </RRListItem>
                        <RRListItem
                            button
                            to={{ pathname: '/dashboard/' + side + '/transactions' }}
                            className={classnames({ [classes.active]: location === 'transactions' })}
                        >
                            <ListItemIcon>
                                <span>
                                    {pendingTrsCount > 0 ?
                                        <Badge
                                            badgeContent={pendingTrsCount <= 9 ? pendingTrsCount : '9+'}
                                            color="primary"
                                        ></Badge> : <SwapHorizontalIcon />}
                                </span>
                            </ListItemIcon>
                            <ListItemText inset primary={t('TRANSACTIONS')} />
                        </RRListItem>
                    </div>
                    <div>
                        <Anchor target='_blank' href='https://medium.com/adex-network-tips-and-tricks' >
                            <ListItem
                                button
                            >
                                <ListItemIcon>
                                    <HelpOutlineIcon />
                                </ListItemIcon>
                                <ListItemText inset primary={t('HELP')} />
                            </ListItem>
                        </Anchor>

                        <RRListItem
                            button
                            to={{ pathname: '/dashboard/' + this.props.side + '/account' }}
                            className={classnames({ [classes.active]: location === 'account' })}
                        >
                            <ListItemIcon>
                                <AccountBoxIcon />
                            </ListItemIcon>
                            <ListItemText inset primary={t('ACCOUNT')} />
                        </RRListItem>
                    </div>
                </List>
                <div
                    className={classes.version}
                >
                    <div className={classes.adxLink}>
                        <small> &copy; {(new Date()).getFullYear()}  &nbsp;
                            <Anchor
                                className={classes.adxLink}
                                target='_blank'
                                href={process.env.ADEX_SITE_HOST}
                            >
                                AdEx Network OÜ
                                 </Anchor>
                        </small>
                    </div>
                    <div>
                        <small>
                            <Anchor
                                className={classes.adxLink}
                                target='_blank'
                                href={process.env.ETH_SCAN_ADDR_HOST + process.env.ADX_TOKEN_ADDR}
                            >
                                AdEx (ADX) Token
                               </Anchor>
                        </small>
                        <small> / </small>
                        <small>
                            <Anchor
                                className={classes.adxLink}
                                target='_blank'
                                href={process.env.ETH_SCAN_ADDR_HOST + process.env.ADX_EXCHANGE_ADDR}
                            >
                                AdEx Exchange
                               </Anchor>
                        </small>
                    </div>
                    <div>
                        <small>
                            <Anchor
                                className={classes.adxLink}
                                target='_blank'
                                href='https://github.com/AdExBlockchain/adex-dapp/blob/master/CHANGELOG.md'
                            >
                                v.{packageJson.version}-beta
                            </Anchor>
                        </small>
                    </div>
                </div>
            </div >
        )
    }
}

SideNav.propTypes = {
    actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    const persist = state.persist
    const memory = state.memory
    const side = memory.nav.side

    let bidsKey = ''

    if (side === 'advertiser') {
        bidsKey = 'advBids'
    } else if (side === 'publisher') {
        bidsKey = 'pubBids'
    }


    return {
        // account: persist.account,
        transactions: persist.web3Transactions[persist.account._addr] || {},
        bidsAwaitingActionCount: ((persist.bids[bidsKey] || {}).action || []).length
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
)(Translate(withStyles(styles)(SideNav)))
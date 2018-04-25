import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { List, ListItem, ListDivider } from 'react-toolbox/lib/list'
import theme from './theme.css'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import ChannelIcon from 'components/common/icons/ChannelIcon'
import CircleWithText from 'components/common/icons/CircleWithText'
import Translate from 'components/translate/Translate'
import { NewUnitDialog, NewCampaignDialog, NewSlotDialog, NewChannelDialog } from 'components/dashboard/forms/NewItems'
import FontIcon from 'react-toolbox/lib/font_icon'
import classnames from 'classnames'
import packageJson from './../../../../package.json'
import Anchor from 'components/common/anchor/anchor'
import BidIcon from 'components/common/icons/BidIcon'
// import GasPrice from 'components/dashboard/account/GasPrice'

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

        const location = this.props.location.pathname.replace(/\/dashboard\/(advertiser|publisher)/, '').replace(/\//g, '')
        const isAdvertiser = side === 'advertiser'
        const collection = (isAdvertiser ? 'campaigns' : 'channels')
        const items = (isAdvertiser ? 'units' : 'slots')
        const NewCollectionBtn = (isAdvertiser ? NewCampaignDialog : NewChannelDialog)
        const NewItemBtn = (isAdvertiser ? NewUnitDialog : NewSlotDialog)
        const CollectionIcon = (isAdvertiser ? CampaignIcon : ChannelIcon)
        const itemsIcon = (isAdvertiser ? 'format_list_bulleted' : 'format_list_bulleted')
        const t = this.props.t
        const pendingTrsCount = (this.props.transactions.pendingTxs || []).length

        let pendingTransactionsIcon = <FontIcon value={'swap_horiz'} /> // 'swap_horiz'
        if(pendingTrsCount > 0) {
            pendingTransactionsIcon = <CircleWithText text={pendingTrsCount <= 9 ? pendingTrsCount : '9+' }  className={classnames(theme.bidsActions)}/>
        }

        const bidsAwaitingActionCount = this.props.bidsAwaitingActionCount
        let bidsIcon = <BidIcon style={{ height: 24 }} />

        if(bidsAwaitingActionCount > 0) {
            bidsIcon = <CircleWithText text={bidsAwaitingActionCount <= 9 ? bidsAwaitingActionCount : '9+' }  className={classnames(theme.bidsActions)}/>
        }

        return (
            <div className={theme.navigation}>
                <List >
                    <RRListItem
                        to={{ pathname: '/dashboard/' + side }}
                        selectable={true}
                        caption={t('DASHBOARD')}
                        theme={theme}
                        leftIcon='dashboard'
                        className={classnames({ [theme.active]: location === '' })}
                    />
                    <ListDivider />
                    <RRListItem
                        to={{ pathname: '/dashboard/' + side + '/' + collection }}
                        selectable={true}
                        caption={t(collection.toUpperCase())}
                        theme={theme}
                        leftIcon={<CollectionIcon color='rgb(117, 117, 117)' />}
                        className={classnames({ [theme.active]: location === collection })}
                    />
                    <ListItem
                        selectable={false}
                        ripple={false}
                    >
                        <NewCollectionBtn
                            theme={theme}
                            flat
                            color='first'
                            raised
                        />
                    </ListItem>
                    <ListDivider />
                    <RRListItem
                        to={{ pathname: '/dashboard/' + side + '/' + items }}
                        selectable={true}
                        caption={t(items.toUpperCase())}
                        theme={theme}
                        className={classnames({ [theme.active]: location === items })}
                        leftIcon={itemsIcon}
                    />
                    <ListItem
                        selectable={false}
                        ripple={false}
                    >
                        <NewItemBtn
                            theme={theme}
                            flat
                            color='second'
                            raised
                        />
                    </ListItem>
                    <ListDivider />
                    <RRListItem
                        to={{ pathname: '/dashboard/' + side + '/bids' }}
                        selectable={true}
                        caption={t('BIDS')}
                        theme={theme}
                        className={classnames({ [theme.active]: location === 'bids', [theme.bidsActions]: bidsAwaitingActionCount > 0 })}
                        leftIcon={bidsIcon}
                    />
                    <RRListItem
                        to={{ pathname: '/dashboard/' + side + '/transactions' }}
                        selectable={true}
                        caption={t('TRANSACTIONS')}
                        theme={theme}
                        className={classnames({ [theme.active]: location === 'transactions', [theme.pendingTransactions]: pendingTrsCount > 0 })}
                        leftIcon={pendingTransactionsIcon}
                    />
                </List>
                <div className={theme.listBottom} >
                    <List>
                        <ListItem
                            selectable={false}
                            ripple={false}
                        >
                            {/* <GasPrice theme={theme}/> */}
                        </ListItem>
                        <Anchor target='_blank' href='https://medium.com/adex-network-tips-and-tricks' >
                            <ListItem
                                leftIcon='help_outline'
                                selectable={true}
                                caption={t('HELP')}
                                theme={theme}
                            />
                        </Anchor>
                        <RRListItem
                            to={{ pathname: '/dashboard/' + this.props.side + '/account' }}
                            selectable={true}
                            caption={t('ACCOUNT')}
                            theme={theme}
                            leftIcon='account_box'
                            className={classnames({ [theme.active]: location === 'account' })}
                        />
                    </List>
                </div>

                <div className={theme.version}>
                    <div>
                        <small> &copy; {(new Date()).getFullYear()}
                            <Anchor className={theme.adxLink} target='_blank' href={process.env.ADEX_SITE_HOST} > AdEx Network OÜ </Anchor>
                        </small>
                    </div>
                    <div>
                        <small>
                            <Anchor className={theme.adxLink} target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + process.env.ADX_TOKEN_ADDR} > AdEx (ADX) Token </Anchor>
                        </small>
                        <small> / </small>
                        <small>
                            <Anchor className={theme.adxLink} target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + process.env.ADX_EXCHANGE_ADDR} > AdEx Exchange </Anchor>
                        </small>
                    </div>
                    <div>
                        <small>
                            <Anchor className={theme.adxLink} target='_blank' href='https://github.com/AdExBlockchain/adex-dapp/blob/master/CHANGELOG.md' >
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
)(Translate(SideNav))


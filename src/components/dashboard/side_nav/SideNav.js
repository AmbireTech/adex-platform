import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { List, ListItem } from 'react-toolbox/lib/list'
import theme from './theme.css'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import ChannelIcon from 'components/common/icons/ChannelIcon'
import Translate from 'components/translate/Translate'
import { NewUnit, NewCampaign, NewSlot, NewChannel } from 'components/dashboard/forms/NewItems'
import FontIcon from 'react-toolbox/lib/font_icon'
import { Button, IconButton } from 'react-toolbox/lib/button'
import classnames from 'classnames'
import { exchange as ExchangeConstants } from 'adex-constants'
import packageJson from './../../../../package.json'
const { TX_STATUS } = ExchangeConstants

const RRListItem = withReactRouterLink(ListItem)
const RRIconButton = withReactRouterLink(IconButton)

class SideNav extends Component {

    // shouldComponentUpdate(nextProps, nextState) {
    //     return this.props.side !== nextProps.side
    //   }

    render() {
        const side = this.props.side
        if (side !== 'advertiser' && side !== 'publisher') {
            return null
        }

        const location = this.props.location.pathname.replace(/\/dashboard\/(advertiser|publisher)/, '').replace(/\//g, '')
        const isAdvertiser = side === 'advertiser'
        const collection = (isAdvertiser ? 'campaigns' : 'channels')
        const items = (isAdvertiser ? 'units' : 'slots')
        const NewCollectionBtn = (isAdvertiser ? NewCampaign : NewChannel)
        const NewItemBtn = (isAdvertiser ? NewUnit : NewSlot)
        const CollectionIcon = (isAdvertiser ? CampaignIcon : ChannelIcon)
        const itemsIcon = (isAdvertiser ? 'format_list_bulleted' : 'format_list_bulleted')
        const t = this.props.t
        let transactions = this.props.transactions
        const pendingTrsCount = Object.keys(transactions).reduce((memo, key) => {

            let itm = { ...transactions[key] }
            if (itm && itm.status === TX_STATUS.Pending.id) {
                memo += 1
            }

            return memo
        }, 0)

        let pendingTransactionsIcon = 'swap_horiz'
        if ((pendingTrsCount > 0) && (pendingTrsCount <= 9)) {
            pendingTransactionsIcon = 'filter_' + pendingTrsCount
        } else if (pendingTrsCount > 9) {
            pendingTransactionsIcon = 'filter_9_plus'
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
                    <RRListItem
                        to={{ pathname: '/dashboard/' + side + '/transactions' }}
                        selectable={true}
                        caption={t('TRANSACTIONS')}
                        theme={theme}
                        className={classnames({ [theme.active]: location === 'transactions' })}
                        leftIcon={<FontIcon value={pendingTransactionsIcon} style={{ color: pendingTrsCount > 0 ? '#FF5722' : '' }} />}
                    />
                </List>
                <div className={theme.listBottom} >
                    <List>
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
                        <small> &copy; {(new Date()).getFullYear()} AdEx Network OÜ</small>
                    </div>
                    <div>
                        <small> v.{packageJson.version}-beta </small>
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
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        transactions: persist.web3Transactions[persist.account._addr] || {}
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


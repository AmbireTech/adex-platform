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
import classnames from 'classnames'
import packageJson from './../../../../package.json'
import Anchor from 'components/common/anchor/anchor'

const RRListItem = withReactRouterLink(ListItem)

class SideNav extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        let langChanged = this.props.language !== nextProps.language
        let sideChanged = this.props.side !== nextProps.side
        let locationChanged = this.props.location.pathname !== nextProps.location.pathname
        let transactionsChanged = (this.props.transactions.pendingTxs || []).length !== (nextProps.transactions.pendingTxs || []).length
        return langChanged || sideChanged || locationChanged || transactionsChanged
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
        const NewCollectionBtn = (isAdvertiser ? NewCampaign : NewChannel)
        const NewItemBtn = (isAdvertiser ? NewUnit : NewSlot)
        const CollectionIcon = (isAdvertiser ? CampaignIcon : ChannelIcon)
        const itemsIcon = (isAdvertiser ? 'format_list_bulleted' : 'format_list_bulleted')
        const t = this.props.t
        const pendingTrsCount = (this.props.transactions.pendingTxs || []).length

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
                        <small> &copy; {(new Date()).getFullYear()} AdEx Network OÜ</small>
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
        // account: persist.account,
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


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

const RRListItem = withReactRouterLink(ListItem)

class SideNav extends Component {

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

                let itm = {...transactions[key]}
                if(itm && itm.status === 'TRANSACTION_STATUS_PENDING') {
                    memo += 1
                }

            return memo
        }, 0)

        return (
            <div className="Navigation">
                <List kor={location} >
                    <RRListItem
                        to={{ pathname: '/dashboard/' + side }}
                        selectable={true}
                        caption={t('DASHBOARD')}
                        theme={theme}
                        leftIcon='dashboard'
                        activeClassName={theme.active}
                    />
                    <RRListItem
                        to={{ pathname: '/dashboard/' + side + '/' + collection }}
                        selectable={true}
                        caption={t(collection.toUpperCase())}
                        theme={theme}
                        leftIcon={<CollectionIcon color='rgb(117, 117, 117)' />}
                        activeClassName={theme.active}
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
                        activeClassName={theme.active}
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
                        activeClassName={theme.active}
                        leftIcon={<FontIcon value='swap_horiz' style={{color: pendingTrsCount > 0 ? '#FF5722' : ''}}/>}
                    />
                </List>
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


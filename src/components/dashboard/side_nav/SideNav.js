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

const RRListItem = withReactRouterLink(ListItem)

class SideNav extends Component {

    renderAdvertiser() {
        return (
            <List selectable={true} selected="2" ripple >
                <RRListItem
                    to={{ pathname: '/dashboard/' + this.props.side }}
                    selectable={true}
                    value="1"
                    caption={this.props.t('DASHBOARD')}
                    theme={theme}
                    className="side-nav-link"
                    leftIcon='dashboard'
                    disabled
                />
                <RRListItem
                    to={{ pathname: '/dashboard/' + this.props.side + "/campaigns" }}
                    selectable={true}
                    value="2"
                    caption={this.props.t('CAMPAIGNS')}
                    theme={theme}
                    className="side-nav-link"
                    leftIcon={<CampaignIcon color='rgb(117, 117, 117)' />}
                    disabled
                />
                <ListItem
                    selectable={false}
                    ripple={false}
                >
                    <NewCampaign theme={theme} flat color='first' raised disabled/>
                </ListItem>
                <RRListItem
                    to={{ pathname: '/dashboard/' + this.props.side + "/units" }}
                    selectable={true}
                    value="3"
                    caption={this.props.t('UNITS')}
                    theme={theme}
                    className="side-nav-link"
                    leftIcon='format_list_bulleted'
                    disabled
                />
                <ListItem
                    selectable={false}
                    ripple={false}
                >
                    <NewUnit theme={theme} flat color='second' raised disabled />
                </ListItem>
                <RRListItem
                    to={{ pathname: '/dashboard/auction/ink'}}
                    selectable={true}
                    value="3"
                    caption={this.props.t('INK_AUCTION')}
                    theme={theme}
                    className="side-nav-link"
                    leftIcon='local_airport'
                />
            </List>
        )
    }

    renderPublisher() {
        return (
            <List selectable={true} selected="2" ripple >
                <RRListItem
                    to={{ pathname: '/dashboard/' + this.props.side }}
                    selectable={true}
                    value="1"
                    caption={this.props.t('DASHBOARD')}
                    theme={theme}
                    className="side-nav-link"
                    leftIcon='dashboard'
                />
                <RRListItem
                    to={{ pathname: '/dashboard/' + this.props.side + "/channels" }}
                    selectable={true}
                    value="2"
                    caption={this.props.t('CHANNELS')}
                    theme={theme}
                    className="side-nav-link"
                    leftIcon={<ChannelIcon color='rgb(117, 117, 117)' />}
                />
                <ListItem
                    selectable={false}
                    ripple={false}
                >
                    <NewChannel theme={theme} flat color='first' raised />

                </ListItem>
                <RRListItem
                    to={{ pathname: '/dashboard/' + this.props.side + "/slots" }}
                    selectable={true}
                    value="3"
                    caption={this.props.t('SLOTS')}
                    theme={theme}
                    className="side-nav-link"
                    leftIcon='format_list_bulleted'
                />
                <ListItem
                    selectable={false}
                    ripple={false}
                >
                    <NewSlot theme={theme} flat color='second' raised />
                </ListItem>
                <RRListItem
                    to={{ pathname: '/dashboard/auction/ink'}}
                    selectable={true}
                    value="3"
                    caption={this.props.t('INK_AUCTION')}
                    theme={theme}
                    className="side-nav-link"
                    leftIcon='local_airport'
                />
            </List>
        )
    }

    render() {

        return (
            <div className="Navigation">
                {/* TEMP */}
                {this.props.side === 'publisher' ?
                    this.renderPublisher() : null}
                {this.props.side === 'advertiser' ?
                    this.renderAdvertiser() : null}
            </div >
        )
    }
}


SideNav.propTypes = {
    actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account
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


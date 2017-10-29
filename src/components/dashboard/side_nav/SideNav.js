import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'

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
                    caption='Dashboard'
                    theme={theme}
                    className="side-nav-link"
                    leftIcon='dashboard'
                />
                <RRListItem
                    to={{ pathname: '/dashboard/' + this.props.side + "/campaigns" }}
                    selectable={true}
                    value="2"
                    caption='Campaigns'
                    theme={theme}
                    className="side-nav-link"
                    leftIcon={<CampaignIcon color='rgb(117, 117, 117)' />}
                />
                <ListItem
                    selectable={false}
                    ripple={false}
                >
                    <NewCampaign flat primary />
                </ListItem>
                <RRListItem
                    to={{ pathname: '/dashboard/' + this.props.side + "/units" }}
                    selectable={true}
                    value="3"
                    caption='Units'
                    theme={theme}
                    className="side-nav-link"
                    leftIcon='format_list_bulleted'
                />
                <ListItem
                    selectable={false}
                    ripple={false}
                >
                    <NewUnit flat accent />
                </ListItem>
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
                    caption='Dashboard'
                    theme={theme}
                    className="side-nav-link"
                    leftIcon='dashboard'
                />
                <RRListItem
                    to={{ pathname: '/dashboard/' + this.props.side + "/channels" }}
                    selectable={true}
                    value="2"
                    caption='Channels'
                    theme={theme}
                    className="side-nav-link"
                    leftIcon={<ChannelIcon color='rgb(117, 117, 117)' />}
                />
                <ListItem
                    selectable={false}
                    ripple={false}
                >
                    <NewChannel flat primary />

                </ListItem>
                <RRListItem
                    to={{ pathname: '/dashboard/' + this.props.side + "/slots" }}
                    selectable={true}
                    value="3"
                    caption='Slots'
                    theme={theme}
                    className="side-nav-link"
                    leftIcon='format_list_bulleted'
                />
                <ListItem
                    selectable={false}
                    ripple={false}
                >
                    <NewSlot flat accent />
                </ListItem>
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
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        campaigns: state.campaigns
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


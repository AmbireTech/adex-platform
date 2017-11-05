import React from 'react'
import { Layout, Panel, NavDrawer } from 'react-toolbox/lib/layout'
import SideNav from './side_nav/SideNav'
import TopBar from './top_bar/TopBar'
import theme from './theme.css'
import { Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Campaign from './containers/Campaign'
import Channel from './containers/Channel'
import DashboardStats from './containers/DashboardStats'
import Unit from './containers/Unit'
import Slot from './containers/Slot'
import Items from './containers/Items'
import { ItemsTypes } from 'constants/itemsTypes'

import Translate from 'components/translate/Translate'
import { NewUnit, NewCampaign, NewSlot, NewChannel } from './forms/NewItems'


// console.log('actions', actions)
class Dashboard extends React.Component {
    state = {
        drawerActive: false,
        drawerPinned: false,
        sidebarPinned: false
    }

    componentWillMount(nextProps) {
        this.props.actions.updateNav('side', this.props.match.params.side)
    }

    toggleDrawerActive = () => {
        this.setState({ drawerActive: !this.state.drawerActive })
    }

    toggleDrawerPinned = () => {
        this.setState({ drawerPinned: !this.state.drawerPinned })
    }

    toggleSidebar = () => {
        this.setState({ sidebarPinned: !this.state.sidebarPinned })
    }

    renderAdUnits = () => {
        return (
            <Items
                header="All Units"
                viewModeId="rowsViewUnits"
                itemsType={ItemsTypes.AdUnit.id}
                newItemBtn={() => <NewUnit floating accent />}
            />
        )
    }

    renderCampaigns = () => {
        return (
            <Items
                header="All Campaigns"
                viewModeId="rowsViewCampaigns"
                itemsType={ItemsTypes.Campaign.id}
                newItemBtn={() => <NewCampaign floating accent />}
            />
        )
    }

    renderAdSlots = () => {
        return (
            <Items
                header="All Slots"
                viewModeId="rowsViewSlots"
                itemsType={ItemsTypes.AdSlot.id}
                newItemBtn={() => <NewSlot floating accent />}
            />
        )
    }

    renderChannels = () => {
        return (
            <Items
                header="All Channels"
                viewModeId="rowsViewChannels"
                itemsType={ItemsTypes.Channel.id}
                newItemBtn={() => <NewChannel floating accent />}
            />
        )
    }

    Dash = () => {

        return (
            <div>
                {this.props.t("DASHBOARD")}
            </div>
        )
    }

    render() {
        let side = this.props.side || this.props.match.params.side

        return (
            <Layout theme={theme} >
                <NavDrawer pinned={true} theme={theme}>
                    <SideNav side={side} data={this.props.account} />
                </NavDrawer >

                <Panel theme={theme} >
                    <TopBar side={side} />
                    <Switch>
                        {/* TODO: Make things dynamic if easier */}
                        <Route exact path="/dashboard/advertiser/campaigns" component={this.renderCampaigns} />
                        <Route exact path="/dashboard/advertiser/units" component={this.renderAdUnits} />
                        <Route exact path="/dashboard/advertiser/Campaign/:itemId" component={Campaign} />
                        <Route exact path="/dashboard/advertiser/AdUnit/:itemId" component={Unit} />

                        <Route exact path="/dashboard/publisher/channels" component={this.renderChannels} />
                        <Route exact path="/dashboard/publisher/slots" component={this.renderAdSlots} />
                        <Route exact path="/dashboard/publisher/Channel/:itemId" component={Channel} />
                        <Route exact path="/dashboard/publisher/AdSlot/:itemId" component={Slot} />

                        <Route exact path="/dashboard/:side" component={DashboardStats} />
                        <Route component={() => <h1>404 at {side} side</h1>} />
                    </Switch>
                </Panel>
            </Layout>
        );
    }
}

Dashboard.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    return {
        account: state.account
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
)(Translate(Dashboard))

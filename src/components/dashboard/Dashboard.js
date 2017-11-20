import React from 'react'
import { Layout, Panel, NavDrawer } from 'react-toolbox/lib/layout'
import SideNav from './side_nav/SideNav'
import TopBar from './top_bar/TopBar'
import theme from './theme.css'
import { Route, Switch, Redirect } from 'react-router-dom'
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
import Auction from './Ink/Auction'
import Signin from 'components/signin/Signin'

import Translate from 'components/translate/Translate'
import { NewUnit, NewCampaign, NewSlot, NewChannel } from './forms/NewItems'

function PrivateRoute({ component: Component, auth, ...other }) {
    return (
        <Route
            {...other}
            render={(props) => auth === true
                ? <Component {...props} />
                : <Redirect to={{ pathname: '/', state: { from: props.location } }} />}
        />
    )
}

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
                header={this.props.t('ALL_UNITS')}
                viewModeId='rowsViewUnits'
                itemsType={ItemsTypes.AdUnit.id}
                newItemBtn={() => <NewUnit floating accent />}
            />
        )
    }

    renderCampaigns = () => {
        return (
            <Items
                header={this.props.t('ALL_CAMPAIGNS')}
                viewModeId='rowsViewCampaigns'
                itemsType={ItemsTypes.Campaign.id}
                newItemBtn={() => <NewCampaign floating accent />}
            />
        )
    }

    renderAdSlots = () => {
        return (
            <Items
                header={this.props.t('ALL_SLOTS')}
                viewModeId='rowsViewSlots'
                itemsType={ItemsTypes.AdSlot.id}
                newItemBtn={() => <NewSlot floating accent />}
            />
        )
    }

    renderChannels = () => {
        return (
            <Items
                header={this.props.t('ALL_CHANNELS')}
                viewModeId='rowsViewChannels'
                itemsType={ItemsTypes.Channel.id}
                newItemBtn={() => <NewChannel floating accent />}
            />
        )
    }

    Dash = () => {

        return (
            <div>
                {this.props.t('DASHBOARD')}
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
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/campaigns' component={this.renderCampaigns} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/units' component={this.renderAdUnits} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/Campaign/:itemId' component={Campaign} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/advertiser/AdUnit/:itemId' component={Unit} />

                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/channels' component={this.renderChannels} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/slots' component={this.renderAdSlots} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/Channel/:itemId' component={Channel} />
                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/publisher/AdSlot/:itemId' component={Slot} />

                        <PrivateRoute auth={this.props.auth} exact path={'/dashboard/' + side + "/Ink-auction"} component={Auction} />

                        <PrivateRoute auth={this.props.auth} exact path='/dashboard/:side' component={DashboardStats} />
                        <PrivateRoute auth={this.props.auth} component={() => <h1>404 at {side} side</h1>} />
                    </Switch>
                </Panel>
            </Layout>
        );
    }
}

Dashboard.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    auth: PropTypes.bool.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    let account = persist.account
    return {
        account: account,
        // TODO: temp until we decide how to handle the logged in state
        auth: !!account._temp && (!!account._temp.pwDerivedKey || !!account._temp.password) // !!memory.signin.publicKey
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

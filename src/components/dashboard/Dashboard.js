import React from 'react'
import { Layout, Panel, NavDrawer } from 'react-toolbox/lib/layout'
import SideNav from './side_nav/SideNav'
import TopBar from './top_bar/TopBar'
import theme from './theme.css'
import { Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'
import Campaign from './containers/Campaign'
import Unit from './containers/Unit'
import Items from './containers/Items'
import { ItemsTypes } from 'constants/itemsTypes'
import NewItemWithDialog from './forms/NewItemWithDialog'
import NewItemSteps from './forms/NewItemSteps'
import NewUnitForm from './forms/NewUnitForm'
import NewCampaignForm from './forms/NewCampaignForm'

const NewItemStepsWithDialog = NewItemWithDialog(NewItemSteps)

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
                newItemBtn={() =>
                    <NewItemStepsWithDialog
                        btnLabel="New Unit"
                        title="Create new unit"
                        accent
                        floating
                        itemType={ItemsTypes.AdUnit.id}
                        pageTwo={NewUnitForm}
                    />
                } />
        )
    }

    renderCampaigns = () => {
        return (
            <Items
                header="All Campaigns"
                viewModeId="rowsViewCampaigns"
                itemsType={ItemsTypes.Campaign.id}
                newItemBtn={() =>
                    <NewItemStepsWithDialog
                        floating
                        accent
                        addCampaign={this.props.actions.addCampaign}
                        btnLabel="New Campaign"
                        title="Create new Campaign"
                        itemType={ItemsTypes.Campaign.id}
                        pageTwo={NewCampaignForm}
                    />
                } />
        )
    }

    Dash = () => {

        return (
            <div>
                Dashboard
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
                        <Route exact path="/dashboard/:side" component={this.Dash} />
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
)(Dashboard)

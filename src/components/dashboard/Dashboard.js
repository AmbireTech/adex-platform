import React from 'react'
import { Layout, Panel, NavDrawer } from 'react-toolbox/lib/layout'
import SideNav from './side_nav/SideNav'
import TopBar from './top_bar/TopBar'
import theme from './theme.css'

import { Route, Switch } from 'react-router-dom'
// import { ItemTypes } from './../../models/DummyData'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../actions/campaignActions'

import Campaigns from './containers/Campaigns'
import Campaign from './containers/Campaign'
import Unit from './containers/Unit'
import Units from './containers/Units'

class Dashboard extends React.Component {
    state = {
        drawerActive: false,
        drawerPinned: false,
        sidebarPinned: false
    };

    toggleDrawerActive = () => {
        this.setState({ drawerActive: !this.state.drawerActive })
    };

    toggleDrawerPinned = () => {
        this.setState({ drawerPinned: !this.state.drawerPinned })
    }

    toggleSidebar = () => {
        this.setState({ sidebarPinned: !this.state.sidebarPinned })
    };

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
                        <Route exact path="/dashboard/:side/campaigns" component={Campaigns} />
                        <Route exact path="/dashboard/:side/units" component={Units} />
                        <Route exact path="/dashboard/:side/Campaign/:campaign" component={Campaign} />
                        <Route exact path="/dashboard/:side/AdUnit/:unit" component={Unit} />
                        <Route exact path="/dashboard/:side">
                            <h1>Welcome to the {side} side</h1>
                        </Route>
                    </Switch>
                </Panel>
            </Layout>
        );
    }
}

Dashboard.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
};

function mapStateToProps(state) {

    // console.log('mapStateToProps', state)
    return {
        account: state.account
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Dashboard);

//export default Dashboard;

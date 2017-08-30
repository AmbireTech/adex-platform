import React from 'react';
import { Checkbox } from 'react-toolbox/lib/checkbox';
import { Layout, Panel, NavDrawer } from 'react-toolbox/lib/layout';
import SideNav from './side_nav/SideNav';
import TopBar from './top_bar/TopBar';
import theme from './theme.css'
import AdexIconTxt from './../common/icons/AdexIconTxt';

import { Route, Switch } from 'react-router-dom';
import { advertiserData } from './advertiserData'

class Dashboard extends React.Component {
    state = {
        drawerActive: false,
        drawerPinned: false,
        sidebarPinned: false
    };

    toggleDrawerActive = () => {
        console.log('hoiiii');
        this.setState({ drawerActive: !this.state.drawerActive });
    };

    toggleDrawerPinned = () => {
        this.setState({ drawerPinned: !this.state.drawerPinned });
    }

    toggleSidebar = () => {
        this.setState({ sidebarPinned: !this.state.sidebarPinned });
    };

    render() {
        console.log('this.props.match.params', this.props.match.params)
        let side = this.props.match.params.side;
        let campaign = this.props.match.params.campaign;
        let unit = this.props.match.params.unit;

        return (
            <Layout theme={theme} >
                <NavDrawer pinned={true} theme={theme}>
                    <SideNav side={side} data={advertiserData}/>
                </NavDrawer >
           
                <Panel theme={theme} scrollY={true}>
                    <TopBar side={side}/>
      
            
                        <Switch>
                            <Route exact path="/dashboard/:side">
                                <h1>Welcome to the {side} side</h1>
                            </Route>
                            <Route path="/dashboard/:side/campaigns">
                                <div>
                                    
                                </div>
                            </Route>
                            <Route path="/dashboard/:side/campaigns/:campaign">
                                <div>
                                <h1>items</h1>
                                <AdexIconTxt />
                                </div>
                            </Route>
                            <Route path="/dashboard/:side/:campaign/:unit">
                                <h1>slots</h1>
                            </Route>
                        </Switch>
       
                </Panel>
            </Layout>
        );
    }
}

export default Dashboard;

import React from 'react';
import { Layout, Panel, NavDrawer } from 'react-toolbox/lib/layout';
import SideNav from './side_nav/SideNav';
import TopBar from './top_bar/TopBar';
import theme from './theme.css'
import AdexIconTxt from './../common/icons/AdexIconTxt';

import { Route, Switch, Link } from 'react-router-dom';
import { advertiserData } from './test-data'

const Campaign = ({match, location}) => {
    console.log('match', match)
    let side = match.params.side;
    let campaign = match.params.campaign;

    return (
        <div>
            <div>
                <h2>Campaign name: {campaign} </h2>
            </div>

            {advertiserData.cmpaigns.filter((c) => c.name === campaign).map((camp, i) => {

                return(
                    camp.data.units.map((u, i) => {
                        return (
                            <div key={i}>
                                <h3> {u.name} </h3>
                                <div> {u.type} </div>
                                <div> {u.size} </div>
                                <Link to={'/dashboard/' + side + '/' + camp.name + '/' + u.name }> {u.name}</Link>
                            </div>
                        )
                    })
                )
            })}       
        </div>
    )
}

const Unite = ({match, location}) => {
    console.log('match', match)
    let campaign = match.params.campaign;
    let unite = match.params.unite;

    return (
        <div>
            <div>
                <h2>Campaign {campaign} </h2>
                <h2>Unite: {unite} </h2>
            </div>
        </div>
    )
}

const Campaigns = ({match, location}) => {
    let side = match.params.side;

    return (
        <div>
            <h1>All campaigns </h1>

            {advertiserData.cmpaigns.map((camp, i) => {
                return(
                    <div>
                        <h3> {camp.name} </h3>
                        <img src={camp.logo} style={{width: 200, height: 200}} alt={camp.name}/>
                        <Link to={'/dashboard/' + side + '/' + camp.name }> {camp.name}</Link>
                    </div>
                )
            })}
        </div>
    )
}

class Dashboard extends React.Component {
    state = {
        drawerActive: false,
        drawerPinned: false,
        sidebarPinned: false
    };

    toggleDrawerActive = () => {
        this.setState({ drawerActive: !this.state.drawerActive });
    };

    toggleDrawerPinned = () => {
        this.setState({ drawerPinned: !this.state.drawerPinned });
    }

    toggleSidebar = () => {
        this.setState({ sidebarPinned: !this.state.sidebarPinned });
    };

    render() {
        let side = this.props.side || this.props.match.params.side;
        return (
            <Layout theme={theme} >
                <NavDrawer pinned={true} theme={theme}>
                    <SideNav side={side} data={advertiserData}/>
                </NavDrawer >
           
                <Panel theme={theme} scrollY={true}>
                    <TopBar side={side}/>            
                        <Switch>
                            <Route exact path="/dashboard/:side/campaigns" component={Campaigns}/>
                            <Route exact path="/dashboard/:side/:campaign/:unite" component={Unite}/>
                            <Route exact path="/dashboard/:side/:campaign" component={Campaign}/>
                            <Route exact path="/dashboard/:side">
                                <h1>Welcome to the {side} side</h1>
                            </Route>
                        </Switch>
       
                </Panel>
            </Layout>
        );
    }
}

export default Dashboard;

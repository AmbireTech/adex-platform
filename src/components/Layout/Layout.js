import React, { Component } from 'react';
import AppBar from 'react-toolbox/lib/app_bar/AppBar';
import Checkbox from 'react-toolbox/lib/checkbox/Checkbox';
import IconButton from 'react-toolbox/lib/button/IconButton';
import Layout from 'react-toolbox/lib/layout/Layout';
import NavDrawer from 'react-toolbox/lib/layout/NavDrawer';
import Panel from 'react-toolbox/lib/layout/Panel';
import Sidebar from 'react-toolbox/lib/layout/Sidebar';

import './Layout.styl'


// Your current PostCSS version is 5.2.17, but postcss-modules-scope uses 6.0.9. Perhaps this is the source of the error below.
// warning "react-toolbox-themr@1.0.2" has incorrect peer dependency "react-toolbox@^2.0.0".
class AppLayout extends Component {
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
        return (
            <Layout>
                <NavDrawer active={this.state.drawerActive}
                    pinned={this.state.drawerPinned} permanentAt='xxxl'
                    onOverlayClick={ this.toggleDrawerActive }>
                    <p>
                        Navigation, account switcher, etc. go here.
                    </p>
                </NavDrawer>
                <Panel>
                    <AppBar leftIcon='menu' onLeftIconClick={ this.toggleDrawerActive } />
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.8rem' }}>
                        <h1>Main Content</h1>
                        <p>Main content goes here.</p>
                        <Checkbox label='Pin drawer' checked={this.state.drawerPinned} onChange={this.toggleDrawerPinned} />
                        <Checkbox label='Show sidebar' checked={this.state.sidebarPinned} onChange={this.toggleSidebar} />
                    </div>
                </Panel>
                <Sidebar pinned={ this.state.sidebarPinned } width={ 5 }>
                    <div><IconButton icon='close' onClick={ this.toggleSidebar }/></div>
                    <div style={{ flex: 1 }}>
                        <p>Supplemental content goes here.</p>
                    </div>
                </Sidebar>
            </Layout>
        );
    }
}

export default AppLayout;

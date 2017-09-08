import React, { Component } from 'react';
import { List, ListItem } from 'react-toolbox/lib/list';
// import {Navigation} from 'react-toolbox/lib/navigation';
import theme from './theme.css'
import { withReactRouterLink } from './../../common/rr_hoc/RRHoc.js';
const RRListItem = withReactRouterLink(ListItem)


class SideNav extends Component {

    render() {

        return (
            <div className="Navigation">
                <List selectable={true} selected="2" ripple >
                    <RRListItem to={{ pathname: '/dashboard/' + this.props.side }}
                        selectable={true}
                        value="1"
                        caption='Dashboard'
                        theme={theme}
                        className="side-nav-link" />
                    <RRListItem to={{ pathname: '/dashboard/' + this.props.side + "/campaigns" }}
                        selectable={true}
                        value="2"
                        caption='Campaigns'
                        theme={theme}
                        className="side-nav-link" />
                    <RRListItem to={{ pathname: '/dashboard/' + this.props.side + "/units" }}
                        selectable={true}
                        value="3"
                        caption='Units'
                        theme={theme}
                        className="side-nav-link" />
                </List>
            </div >
        );
    }
}

export default SideNav;

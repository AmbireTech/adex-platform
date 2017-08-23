import React, {Component} from 'react';
import { List, ListItem } from 'react-toolbox/lib/list';
import { Link } from 'react-router-dom';
import theme from './SideNav.css'

class SideNav extends Component {

  render () {

      return (
        <List selectable ripple >
            <Link to="/dashboard/campaigns" className="side-nav-link" >
                <ListItem caption='campaigns' theme={theme} />
            </Link>
            <Link to="/dashboard/items" className="side-nav-link">
                <ListItem caption='items' theme={theme} />
            </Link>
            <Link to="/dashboard/slots" className="side-nav-link">
                <ListItem caption='slots' theme={theme}/>
            </Link>
        </List>
      );
  }
}

export default SideNav;

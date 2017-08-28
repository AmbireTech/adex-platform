import React, {Component} from 'react';
import { List, ListItem } from 'react-toolbox/lib/list';
import { Link } from 'react-router-dom';
import {Link as ToolboxLink} from 'react-toolbox/lib/link';
import {Navigation} from 'react-toolbox/lib/navigation';
import theme from './theme.css'


class SideNav extends Component {

  render () {

      return (
        <div className="Navigation">
            <List selectable selected="2" ripple >
                <Link to={{ pathname: '/dashboard/' + this.props.side + "/campaigns"  }} 
                    className="side-nav-link" >
                    <ListItem selectable value="1" caption='campaigns' theme={theme} className="side-nav-link"/>
                </Link>
                <Link to={{ pathname: '/dashboard/' + this.props.side + "/items"  }} 
                    className="side-nav-link">
                    <ListItem selectable value="3" caption='items' theme={theme} />
                </Link>
                <Link to={{ pathname: '/dashboard/' + this.props.side + "/slots"  }} 
                    className="active">
                    <ListItem active selected selectable value="2" caption='slots' theme={theme}/>
                </Link>
                <ToolboxLink href='http://'  label='Profile' icon='person' />
            </List>
        </div >
      );
  }
}

export default SideNav;

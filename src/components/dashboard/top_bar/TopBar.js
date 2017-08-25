import React, { Component } from 'react';
import theme from './theme.css';
import { AppBar } from 'react-toolbox/lib/app_bar';
import AdexIcon from './../../common/icons/AdexIcon';
import {Navigation} from 'react-toolbox/lib/navigation';
import {Link} from 'react-toolbox/lib/link';
import { IconMenu, MenuItem, MenuDivider, Menu } from 'react-toolbox/lib/menu';
import ButtonMenu from './../../common/button_menu/ButtonMenu'
import {Button} from 'react-toolbox/lib/button';

let testNotifications = [{name: 'test notif 1', seen: true}, {name: 'test notif 2', seen: false}, {name: 'test notif 3', seen: true}]

class TopNav extends Component {

  render() {
    console.log('theme', theme) 
    return (
      <AppBar title="Publisher" onLeftIconClick={() => alert('hoi')} leftIcon={<AdexIcon />} fixed={true} theme={theme} flat={false} >
        <Navigation type='horizontal'>

          <IconMenu selected='help' selectable icon='notifications' position='auto' menuRipple >
            {testNotifications.map((notif, index) => 
              <MenuItem shortcut={notif.name} selectable value={index} icon={notif.seen ? 'done' : 'info' } caption={notif.name} />
            )}
            <MenuDivider />
            <MenuItem selectable value='signout' icon='weekend' caption='Mark all as seen' disabled />
          </IconMenu>

          <Link href='http://' active icon='mail' />
          
          <ButtonMenu selectable selected='help' icon='expand_more' label="John Smith" position='auto' menuRipple active={true} iconRight={true} iconStyle={{marginTop: -2, marginLeft: 10, fontSize: 20}}>
            <MenuItem value='download' icon='get_app' caption='Download' />
            <MenuItem value='help' selected={true} selectable icon='favorite' caption='Favorite' />
            <MenuItem value='settings' icon='open_in_browser' caption='Open in app' />
            <MenuDivider />
            <MenuItem value='signout' icon='weekend' caption='HOI' disabled />
          </ButtonMenu>

        </Navigation>
      </AppBar>
    );
  }
}

export default TopNav;

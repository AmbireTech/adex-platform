import React, { Component } from 'react';
import theme from './theme.css';
import { AppBar } from 'react-toolbox/lib/app_bar';
import AdexIcon from './../../common/icons/AdexIcon';
import {Navigation} from 'react-toolbox/lib/navigation';
import {Link} from 'react-toolbox/lib/link';
import { IconMenu, MenuItem, MenuDivider, Menu } from 'react-toolbox/lib/menu';
import ButtonMenu from './../../common/button_menu/ButtonMenu'
import {Button} from 'react-toolbox/lib/button';

class TopNav extends Component {

  render() {
    console.log('theme', theme)
    return (
      <AppBar title="Publisher" leftIcon={<AdexIcon />} fixed={true} theme={theme} flat={false} >
        <Navigation type='horizontal'>

          <IconMenu selected='help' selectable icon='notifications' position='auto' menuRipple theme={theme}>
            <MenuItem  selectable value='download' icon='get_app' caption='Download' theme={theme}/>
            <MenuItem selectable value='help' selected={true}  icon='favorite' caption='Favorite' />
            <MenuItem selectable value='settings' icon='open_in_browser' caption='Open in app' />
            <MenuDivider />
            <MenuItem selectable value='signout' icon='delete' caption='Delete' disabled />
          </IconMenu>

          <Link href='http://' active icon='mail' />
          
          <ButtonMenu icon='expand_more' label="John Smith" position='auto' menuRipple active={true} iconRight={true} iconStyle={{marginTop: -2, marginLeft: 10, fontSize: 20}}>
            <MenuItem value='download' icon='get_app' caption='Download' />
            <MenuItem value='help' icon='favorite' caption='Favorite' />
            <MenuItem value='settings' icon='open_in_browser' caption='Open in app' />
            <MenuDivider />
            <MenuItem value='signout' icon='delete' caption='HOI' disabled />
          </ButtonMenu>

        </Navigation>
      </AppBar>
    );
  }
}

export default TopNav;

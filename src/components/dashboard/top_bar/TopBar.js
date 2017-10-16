import React, { Component } from 'react'
import theme from './theme.css'
import { AppBar } from 'react-toolbox/lib/app_bar'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import { Navigation } from 'react-toolbox/lib/navigation'
import { Link } from 'react-toolbox/lib/link'
import { IconMenu, MenuItem, MenuDivider } from 'react-toolbox/lib/menu'
import ButtonMenu from 'components/common/button_menu/ButtonMenu'

let testNotifications = [{ name: 'test notif 1', seen: true }, { name: 'test notif 2', seen: false }, { name: 'test notif 3', seen: true }]

class TopNav extends Component {

  render() {
    return (
      <AppBar title={this.props.side} onLeftIconClick={() => alert('test')} leftIcon={<AdexIconTxt />} fixed={true} theme={theme} flat={true} >
        <Navigation type='horizontal'>

          <IconMenu selected='help' icon='notifications' position='auto' menuRipple >
            {testNotifications.map((notif, index) =>
              <MenuItem key={index} shortcut={notif.name} value={index} icon={notif.seen ? 'done' : 'info'} caption={notif.name} />
            )}
            <MenuDivider />
            <MenuItem value='signout' icon='weekend' caption='Mark all as seen' disabled />
          </IconMenu>

          <Link href='http://' active icon='mail' />

          <ButtonMenu selectable={true} selected='help' icon='expand_more' label="Ivo Georgiev" position='auto' menuRipple active={true} iconRight={true} iconStyle={{ marginTop: -2, marginLeft: 10, fontSize: 20 }}>
            <MenuItem value='download' icon='get_app' caption='Download' />
            <MenuItem value='help' selected={true} icon='favorite' caption='Favorite' />
            <MenuItem value='settings' icon='open_in_browser' caption='Open in app' />
            <MenuDivider />
            <MenuItem value='signout' icon='weekend' caption='HOI' disabled />
          </ButtonMenu>

        </Navigation>
      </AppBar>
    )
  }
}

export default TopNav

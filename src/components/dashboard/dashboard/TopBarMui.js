import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import theme from './theme.css'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import { Navigation } from 'react-toolbox/lib/navigation'
import ButtonMenu from 'components/common/button_menu/ButtonMenuMui'
import Translate from 'components/translate/Translate'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import ChangeLang from 'components/translate/ChangeLang'
import Switch from 'react-toolbox/lib/switch'
import Anchor from 'components/common/anchor/anchor'
import { AUTH_TYPES } from 'constants/misc'
import metamaskLogo from 'resources/metamask-logo.png'
import trezorLogo from 'resources/trezor-logo-h.png'
import ledgerLogo from 'resources/ledger_logo_header.png'
import { logOut } from 'services/store-data/auth'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import classnames from 'classnames'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import { withStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { styles } from './theme'

const RRMenuItem = withReactRouterLink(MenuItem)
const RRSwitch = withReactRouterLink((props) => <Anchor {...props}><Switch {...props} /></Anchor>)

const SideSwitch = ({ side, t }) => {
  return (
    <div>
      {/* Keep both if there is no valid side and force react to rerender at the same time */}
      {side !== 'advertiser' ?
        <RRSwitch
          checked={true}
          value='account'
          to={{ pathname: '/dashboard/advertiser' }}
          label={t('PUBLISHER')}
        /> : null}
      {side !== 'publisher' ?
        <RRSwitch
          checked={false}
          to={{ pathname: '/dashboard/publisher' }}
          label={t('ADVERTISER')}
        /> : null}
    </div>
  )
}

class TopNav extends Component {

  state = {
    auth: true,
    anchorEl: null,
  }

  render() {
    const t = this.props.t
    let imgSrc = ''

    switch (this.props.account._authMode.authType) {
      case AUTH_TYPES.METAMASK.name:
        imgSrc = metamaskLogo
        break
      case AUTH_TYPES.TREZOR.name:
        imgSrc = trezorLogo
        break
      case AUTH_TYPES.LEDGER.name:
        imgSrc = ledgerLogo
        break
      default:
        break
    }

    const classes = this.props.classes

    return (
      <AppBar
        className={classnames(classes.appBar)}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={this.props.handleDrawerToggle}
            className={classnames(classes.navIconHide)}
          >
            <Icon>menu</Icon>
          </IconButton>
          <AdexIconTxt />
          <SideSwitch side={this.props.side} t={t} />


          {/* <Navigation type='horizontal' className={theme.rightNavigation}> */}
          {/* At the moment we use translations only for proper items properties display names */}
          {/* <ChangeLang /> */}
          {/* <GasPrice /> */}
          <ButtonMenu
            selectable={true}
            leftIconSrc={imgSrc}
            icon='expand_more'
            label={this.props.account._addr || t('NOT_LOGGED')}
            position='auto'
            menuRipple
            active={true}
            iconRight={true}
            iconStyle={{ marginTop: -2, marginLeft: 10, fontSize: 20 }}
            style={{ float: 'right' }}
          >
            <RRMenuItem
              value='account'
              to={{ pathname: '/dashboard/' + this.props.side + '/account' }}
              // icon='account_box'
              caption={t('ACCOUNT')}
            >

              <ListItemIcon className={classes.icon}>
                <Icon>account_box</Icon>
              </ListItemIcon>
              <ListItemText classes={{ primary: classes.primary }} inset primary={t('ACCOUNT')} />
            </RRMenuItem>
            {/* <MenuDivider /> */}
            <MenuItem
              value='logout'
              onClick={() => { logOut() }}
            >
              <ListItemIcon className={classes.icon}>
                <Icon>exit_to_app</Icon>
              </ListItemIcon>
              <ListItemText classes={{ primary: classes.primary }} inset primary={t('LOGOUT')} />
            </MenuItem>
          </ButtonMenu>

        </Toolbar>
      </AppBar>
    )
  }
}

TopNav.propTypes = {
  actions: PropTypes.object.isRequired,
  account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  let persist = state.persist
  // let memory = state.memory
  return {
    account: persist.account,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Translate(withStyles(styles)(TopNav)))


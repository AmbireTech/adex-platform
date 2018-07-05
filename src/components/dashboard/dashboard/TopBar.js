import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import ButtonMenu from 'components/common/button_menu/ButtonMenuMui'
import Translate from 'components/translate/Translate'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
// import ChangeLang from 'components/translate/ChangeLang'
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

import { withStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { styles } from './styles'

const RRMenuItem = withReactRouterLink(MenuItem)

class TopNav extends Component {

  state = {
    auth: true
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
        className={classes.appBar}
        position="sticky"
      >
        <Toolbar
          className={classes.toolbar}
        >
          <div
            className={classes.flexRow}
          >

            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={this.props.handleDrawerToggle}
              className={classnames(classes.navIconHide)}
            >
              <Icon>menu</Icon>
            </IconButton>

            {/* <AdexIconTxt
              className={classes.icon}
            /> */}
            <div
              className={classnames(classes.flex, classes.toolbarControls)}
            >
              {/* <Navigation type='horizontal' className={theme.rightNavigation}> */}
              {/* At the moment we use translations only for proper items properties display names */}
              {/* <ChangeLang /> */}
              {/* <GasPrice /> */}
              <ButtonMenu
                leftIconSrc={imgSrc}
                icon={<ExpandMoreIcon />}
                label={this.props.account._addr || t('NOT_LOGGED')}
                active={true}
                iconStyle={{ marginTop: -2, marginLeft: 10, fontSize: 20 }}
              >
                <RRMenuItem
                  value='account'
                  to={{ pathname: '/dashboard/' + this.props.side + '/account' }}
                  caption={t('ACCOUNT')}
                >
                  <ListItemIcon >
                    <Icon>account_box</Icon>
                  </ListItemIcon>
                  <ListItemText classes={{ primary: classes.primary }} inset primary={t('ACCOUNT')} />
                </RRMenuItem>
                {/* <MenuDivider /> */}
                <MenuItem
                  value='logout'
                  onClick={() => { logOut() }}
                >
                  <ListItemIcon >
                    <Icon>exit_to_app</Icon>
                  </ListItemIcon>
                  <ListItemText classes={{ primary: classes.primary }} inset primary={t('LOGOUT')} />
                </MenuItem>
              </ButtonMenu>
            </div>
          </div>
          <div
            className={classes.flexRow}

          >
            <div
              className={classnames(classes.flex, classes.toolbarTitle)}
            >
              <Typography
                variant="title"
                color="inherit"
                className={classes.flex}
                noWrap
              >
                {t(this.props.navTitle)}
              </Typography>
            </div>
          </div>
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
  const persist = state.persist
  const memory = state.memory
  return {
    account: persist.account,
    navTitle: memory.nav.navTitle || ''
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


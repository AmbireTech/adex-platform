import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { AppBar } from 'react-toolbox/lib/app_bar'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import { Navigation } from 'react-toolbox/lib/navigation'
import { Link } from 'react-toolbox/lib/link'
import { IconMenu, MenuItem, MenuDivider } from 'react-toolbox/lib/menu'
import ButtonMenu from 'components/common/button_menu/ButtonMenu'
import Translate from 'components/translate/Translate'
import { Button, IconButton } from 'react-toolbox/lib/button'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import GasPrice from 'components/dashboard/account/GasPrice'
import ChangeLang from 'components/translate/ChangeLang'

const RRMenuItem = withReactRouterLink(MenuItem)

const SideSwitch = ({ side }) => {
  return (
    <div>
      <ButtonMenu
        label={side}
        position='topLeft'
        menuRipple
        primary={true}
      >
        {/* Keep both if there is no valid side and force react to rerender at the same time */}
        {side !== 'advertiser' ?
          <RRMenuItem
            value='account'
            to={{ pathname: '/dashboard/advertiser' }}
            caption='Advertiser'
          /> : null}
        {side !== 'publisher' ?
          <RRMenuItem
            value='account'
            to={{ pathname: '/dashboard/publisher' }}
            caption='Publisher'
          /> : null}
      </ButtonMenu>
    </div>
  )
}

class TopNav extends Component {

  render() {
    return (
      <AppBar title={<SideSwitch side={this.props.side} />} onLeftIconClick={() => alert('test')} leftIcon={<AdexIconTxt />} fixed={true} theme={theme} flat={true} >

        <Navigation type='horizontal' className={theme.rightNavigation}>
          {/* At the moment we use translations only for proper items properties display names */}
          {/* <ChangeLang /> */}
          <GasPrice />
          <ButtonMenu
            selectable={true}
            selected='help'
            icon='expand_more'
            label={this.props.account._name || 'some username'}
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
              icon='account_box'
              caption='Account'
            />
            <MenuItem value='help' icon='help' caption='Help' />
            <MenuDivider />
            <MenuItem value='logout' icon='exit_to_app' caption='Logout' onClick={() => this.props.actions.resetAccount()} />
          </ButtonMenu>

        </Navigation>
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
)(Translate(TopNav))


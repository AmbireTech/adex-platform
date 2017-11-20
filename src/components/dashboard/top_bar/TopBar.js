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
// import ChangeLang from 'components/translate/ChangeLang'

class TopNav extends Component {

  render() {
    return (
      <AppBar title={this.props.side} onLeftIconClick={() => alert('test')} leftIcon={<AdexIconTxt />} fixed={true} theme={theme} flat={true} >
        <Navigation type='horizontal'>
          {/* At the moment we use translations only for proper items properties display names */}
          {/* <ChangeLang /> */}

          <ButtonMenu selectable={true} selected='help' icon='expand_more' label={this.props.account._name} position='auto' menuRipple active={true} iconRight={true} iconStyle={{ marginTop: -2, marginLeft: 10, fontSize: 20 }}>
            <MenuItem value='settings' icon='settings' caption='Settings' />
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


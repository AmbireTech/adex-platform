import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { IconMenu, MenuItem, MenuDivider } from 'react-toolbox/lib/menu'
import FlagIconFactory from 'react-flag-icon-css'
import adexTranslations from 'adex-translations'

const allLangs = adexTranslations.onlyTranslated

const FlagIcon = FlagIconFactory(React)

class ChangeLang extends Component {

  changeLanguage(newLng) {
    if (this.props.language !== newLng) {
      this.props.actions.changeLanguage(newLng)
    }
  }

  render() {
    return (
      <IconMenu icon={<FlagIcon code={this.props.language.split('-')[1].toLowerCase()} />} menuRipple>
        {allLangs.sort((a, b) => a.split('-')[1].localeCompare(b.split('-')[1])).map((lng) =>
          <MenuItem key={lng} value={lng} icon={<FlagIcon code={lng.split('-')[1].toLowerCase()} />} caption={lng} onClick={this.changeLanguage.bind(this, lng)} />
        )}

      </IconMenu>
    )
  }
}

ChangeLang.propTypes = {
  actions: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired
}

function mapStateToProps(state, props) {
  let persist = state.persist
  // let memory = state.memory
  return {
    language: persist.language
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
)(ChangeLang)

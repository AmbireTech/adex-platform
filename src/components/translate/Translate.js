import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import adexTranslations from 'adex-translations'

const translations = adexTranslations()

export default function Translate(Decorated) {
  class Translated extends Component {

    t(val, { isProp = false } = {}) {
      let key = val + ''
      if (isProp) {
        key = 'PROP_' + key
      }
      key = key.toUpperCase()
      return translations[this.props.language][key] || val
    }

    render() {
      return (
        <div>
          <div>
            <Decorated {...this.props} t={this.t.bind(this)} />
          </div>

        </div>
      )
    }
  }

  Translated.propTypes = {
    actions: PropTypes.object.isRequired,
    language: PropTypes.string.isRequired
  }

  function mapStateToProps(state, props) {
    return {
      language: state.language
    }
  }

  function mapDispatchToProps(dispatch) {
    return {
      actions: bindActionCreators(actions, dispatch)
    }
  }

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(Translated)
}

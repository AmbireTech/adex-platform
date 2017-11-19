import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import adexTranslations from 'adex-translations'

const translations = adexTranslations()

export default function Translate(Decorated) {
  class Translated extends Component {

    interpolate(tpl, args) {
      return tpl.replace(/\${(\w+)}/g, function (_, v) { return args[v] })
    }

    t(val, { isProp = false, args = [] } = {}) {
      let key = val + ''
      if (isProp) {
        key = 'PROP_' + (key.replace(/^_/, ''))
      }
      
      key = key.toUpperCase()

      let translation = translations[this.props.language][key] || val

      if(args.length && Array.isArray(args)){
        translation = this.interpolate(translation, args)
      }

      return translation
    }

    render() {
      return (
          <span>
            <Decorated {...this.props} t={this.t.bind(this)} />
          </span>
      )
    }
  }

  Translated.propTypes = {
    actions: PropTypes.object.isRequired,
    language: PropTypes.string.isRequired
  }

  function mapStateToProps(state, props) {
    state = state.storage
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

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { translate } from 'services/translations/translations'

export default function Translate(Decorated) {
  class Translated extends Component {

    t(val, { isProp = false, args = [''] } = {}) {

      const translation = translate(val, {isProp, args}, this.props.language)

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

  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(Translated)
}

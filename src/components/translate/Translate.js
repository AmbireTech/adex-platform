import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'

export default function Translate(Decorated) {
  class Translated extends Component {

    t(key) {
      return this.props.translations[key] || key
    }

    render() {
      return (
        <div>
          <div>
            <Decorated t={this.t.bind(this)} />
          </div>

        </div>
      )
    }
  }

  Translated.propTypes = {
    actions: PropTypes.object.isRequired,
    translations: PropTypes.object.isRequired
  }

  function mapStateToProps(state, props) {
    return {
      translations: state.translations
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

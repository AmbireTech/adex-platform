import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'


  class ChangeLang extends Component {

    render() {
      return (
        <div>
          <div>
            
          </div>

        </div>
      )
    }
  }

  ChangeLang.propTypes = {
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
  )(ChangeLang)

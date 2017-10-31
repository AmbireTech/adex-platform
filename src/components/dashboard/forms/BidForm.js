import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Button, IconButton } from 'react-toolbox/lib/button'
import theme from './theme.css'
import Input from 'react-toolbox/lib/input'

class BidForm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      bid: 0
    }
  }

  render() {
    return (
      <div>
        <h1> {this.props.slot._name} </h1>
        <Input
          type='number'
          required
          label='Bid amount'
          name='name'
          value={this.state.bid}
          onChange={(value) => this.setState({ bid: value })}
      />
      </div>
    )
  }
}

BidForm.propTypes = {
  actions: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  label: PropTypes.string
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BidForm)

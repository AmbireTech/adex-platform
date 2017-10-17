import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'
import { BrowseButton } from 'react-toolbox/lib/button'
import ipfsAPI from 'ipfs-api'
import Img from 'components/common/img/Img'
import { addImgFromObjectURL } from 'services/ipfs/ipfsService'
import { Button, IconButton } from 'react-toolbox/lib/button'

const ipfs = ipfsAPI('localhost', '5001')

class ImgForm extends Component {

  constructor(props) {
    super(props)

    this.state = {
      imgSrc: '#'
    }
  }

  testUpload = e => {
    addImgFromObjectURL(this.state.imgSrc)
  }

  handleFileChange = e => {
    let that = this
    let objectUrl = URL.createObjectURL(e.target.files[0])
    console.log('objectUrl', objectUrl)

    that.setState({ imgSrc: objectUrl })
  }

  render() {
    return (
      <div>
        <div>
          <BrowseButton
            icon="add"
            label="Select file"
            onChange={this.handleFileChange}
          />
          <img src={this.state.imgSrc} alt={'name'} style={{ maxWidth: 120, maxHeight: 80 }} />
          <Button icon='file_upload' label='Test upload to ipfs' accent onClick={this.testUpload} />

        </div>

      </div>
    )
  }
}

ImgForm.propTypes = {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImgForm)

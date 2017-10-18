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
import theme from './theme.css'
import debounce from 'debounce'

const ipfs = ipfsAPI('localhost', '5001')

class ImgForm extends Component {

  constructor(props) {
    super(props)

    this.state = {
      imgSrc: '',
      imgName: ''
    }

    // Temp until react toolbox update or make own file upload btn
    this.debauncedHandleFileChange = debounce(this.handleFileChange, 200, true)
  }

  testUpload = e => {
    console.log('this.state.imgSrc', this.state.imgSrc)
    addImgFromObjectURL(this.state.imgSrc)
  }

  handleFileChange = e => {
    let that = this
    let file = e.target.files[0]
    console.log('file', file)
    if (!file) return
    let objectUrl = URL.createObjectURL(e.target.files[0])
    console.log('objectUrl', objectUrl)

    that.setState({ imgSrc: objectUrl, imgName: file.name })
    this.props.onChange(objectUrl)
  }

  render() {
    return (
      <div className={theme.imgForm}>
        <BrowseButton
          floating
          icon="file_upload"
          mini
          accent
          onChange={this.debauncedHandleFileChange}
          className={theme.imgUploadBtn}
        />
        {this.state.imgSrc ?
          <img src={this.state.imgSrc} alt={'name'} className={theme.imgPreview} />
          : null
        }
        <span> {this.state.imgName || 'Upload image'} </span>
        {/* <Button icon='file_upload' label='Test upload to ipfs' accent onClick={this.testUpload} /> */}
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

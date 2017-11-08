import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { BrowseButton } from 'react-toolbox/lib/button'
import ipfsAPI from 'ipfs-api'
import Img from 'components/common/img/Img'
import { addImgFromObjectURL } from 'services/ipfs/ipfsService'
import { Button, IconButton } from 'react-toolbox/lib/button'
import theme from './theme.css'
import debounce from 'debounce'
import Dropzone from 'react-dropzone'
import { FontIcon } from 'react-toolbox/lib/font_icon'

const ipfs = ipfsAPI('localhost', '5001')

class ImgForm extends Component {

  constructor(props) {
    super(props)

    this.state = {
      imgSrc: props.imgSrc || '',
      imgName: ''
    }

    // Temp until react toolbox update or make own file upload btn
    this.debauncedHandleFileChange = debounce(this.handleFileChange, 200, true)
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    let that = this
    let file = acceptedFiles[0]
    console.log('file', file)
    if (!file) return
    let objectUrl = URL.createObjectURL(file)
    console.log('objectUrl', objectUrl)

    that.setState({ imgSrc: objectUrl, imgName: file.name })
    this.props.onChange({ tempUrl: objectUrl })
  }

  handleFileChange = e => {
    let that = this
    let file = e.target.files[0]
    console.log('file', file)
    if (!file) return
    let objectUrl = URL.createObjectURL(e.target.files[0])
    console.log('objectUrl', objectUrl)

    that.setState({ imgSrc: objectUrl, imgName: file.name })
    this.props.onChange({ tempUrl: objectUrl })
  }

  // TODO: CLEAR IMG BLOB!!!!
  render() {
    return (
      <div className={theme.imgForm}>
        <div className={theme.imgHeader}>

          {this.state.imgSrc && this.state.imgName ?
            <span> {this.props.label || 'Image'}: {this.state.imgName} </span>
            :
            <span> {this.props.label || 'Upload image'} </span>
          }

          {/* <BrowseButton
            floating
            icon="file_upload"
            mini
            accent
            onChange={this.debauncedHandleFileChange}
            className={theme.imgUploadBtn}
          /> */}

        </div>
        <div>
          <Dropzone accept='.jpeg,.png' onDrop={this.onDrop} className={theme.dropzone} >
            <div className={theme.droppedImgContainer}>
              {this.state.imgSrc ?
                <Img src={this.state.imgSrc} alt={'name'} className={theme.imgDropzonePreview} />
                :
                <div>
                    <FontIcon value='cloud_upload' />
                  <div>
                    <span> Drag and drop file here or click </span>
                  </div>
                </div>
              }
            </div>

          </Dropzone>
        </div>

        {/* <div className={theme.imgHolder}>
          {this.state.imgSrc ?
            <Img src={this.state.imgSrc} alt={'name'} className={theme.imgPreview} />
            : null
          }
        </div> */}
        {/* <Button icon='file_upload' label='Test upload to ipfs' accent onClick={this.testUpload} /> */}
      </div>
    )
  }
}

ImgForm.propTypes = {
  actions: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  imgSrc: PropTypes.string,
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
)(ImgForm)

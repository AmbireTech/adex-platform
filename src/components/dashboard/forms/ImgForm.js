import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Img from 'components/common/img/Img'
import theme from './theme.css'
// import debounce from 'debounce'
import Dropzone from 'react-dropzone'
import { FontIcon } from 'react-toolbox/lib/font_icon'
import Translate from 'components/translate/Translate'
import { IconButton } from 'react-toolbox/lib/button'
import RTButtonTheme from 'styles/RTButton.css'
import ReactCrop from 'react-image-crop'
import { getCroppedImgUrl } from 'services/images/crop'

class ImgForm extends Component {

  constructor(props) {
    super(props)

    this.state = {
      imgSrc: props.imgSrc || '',
      imgName: '',
      cropMode: false,
      crop: {}
    }
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    let that = this
    let file = acceptedFiles[0]
    if (!file) return
    let objectUrl = URL.createObjectURL(file)

    that.setState({ imgSrc: objectUrl, imgName: file.name })
    // TODO: Maybe get width and height here instead on ing validation hoc
    let res = { tempUrl: objectUrl }    
    this.props.onChange(res)
  }

  onRemove = (e) => {
    if (e.stopPropagation) {
      e.stopPropagation()
    }
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation()
    }

    if (this.state.imgSrc) {
      URL.revokeObjectURL(this.state.imgSrc)
      this.setState({ imgSrc: '', imgName: '' })
      this.props.onChange({ tempUrl: null })
    }
  }

  onCropChange = (crop) => {
    this.setState({ crop });
  }

  saveCropped = () => {
    getCroppedImgUrl(this.state.imgSrc, this.state.crop, 'image')
      .then((croppedBlob)=> {
        URL.revokeObjectURL(this.state.imgSrc)
        this.setState({imgSrc: croppedBlob, cropMode: false})
        let res = { tempUrl: croppedBlob }    
        this.props.onChange(res)
      })
  }

  preventBubbling = (e) => {
    if (e.stopPropagation) {
      e.stopPropagation()
    }
    if (e.nativeEvent) {
      e.nativeEvent.stopImmediatePropagation()
    }
  }

  UploadInfo = () => {
    return (
      <div className={theme.uploadInfo}>
        {this.state.imgSrc ?
          <span>
            <IconButton icon='crop' primary onClick={() => this.setState({cropMode: true})} />
            <IconButton icon='clear' className={RTButtonTheme.danger} onClick={this.onRemove} />
          </span>
          : <FontIcon value='file_upload' />
        }
        <div>
          <span> {this.props.t('DRAG_AND_DROP_TO_UPLOAD')} </span>
        </div>
        <div>
          <small> (max 2MB; .jpeg, .jpg, .png)  </small>
        </div>
        <div className={theme.imgErr}>
          {this.props.errMsg}
        </div>
      </div>
    )
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

        </div>
        <div>
          
          {this.state.cropMode ? 
            <div className={theme.cropOverlay} onClick={this.preventBubbling}>
              <div className={theme.droppedImgContainer}>                
                <ReactCrop 
                  style={{maxWidth: '70%', maxHeight: 206}}
                  imageStyle={{maxWidth: '100%', maxHeight: '206px', width: 'auto', height: 'auto'}}
                  className={theme.imgDropzonePreview}
                  crop={this.state.crop}
                  src={this.state.imgSrc || ''}
                  onChange={this.onCropChange}
                />
                <span>
                  <IconButton icon='save' primary onClick={this.saveCropped} />
                  <IconButton icon='clear' className={RTButtonTheme.danger} onClick={() => this.setState({cropMode: false})} />
                </span>
              </div>
            </div>
            :    
            <Dropzone accept='.jpeg,.jpg,.png' onDrop={this.onDrop} className={theme.dropzone} >      
              <div className={theme.droppedImgContainer}>              
                <Img src={this.state.imgSrc} alt={'name'} className={theme.imgDropzonePreview} />
                <this.UploadInfo />
              </div>
            </Dropzone>
          }
          
        </div>
        <div>
          <small> {this.props.additionalInfo} </small>
        </div>
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
)(Translate(ImgForm))

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
import { IconButton, Button } from 'react-toolbox/lib/button'
import RTButtonTheme from 'styles/RTButton.css'
import ReactCrop from 'react-image-crop'
import { getCroppedImgUrl } from 'services/images/crop'

class ImgForm extends Component {

  constructor(props) {
    super(props)

    const aspect = props.size ? (this.props.size.width / this.props.size.height) : undefined

    this.state = {
      imgSrc: props.imgSrc || '',
      imgName: '',
      cropMode: false,
      crop: {aspect: aspect}
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
    getCroppedImgUrl({objUrl: this.state.imgSrc, pixelCrop: this.state.crop, fileName: 'image', size: this.props.size })
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
    const t = this.props.t
    return (
      <div className={theme.uploadInfo}>
        {this.state.imgSrc ?
          <div className={theme.uploadActions}>
            {/* TEMP: make size required */}
            {this.props.size ? <Button icon='crop' raised primary onClick={() => this.setState({cropMode: true})} label={t('IMG_FORM_CROP')} /> : null}  
            &nbsp;
            <Button icon='clear' raised className={RTButtonTheme.danger} onClick={this.onRemove} label={t('IMG_FORM_CLEAR')} />
          </div>
          : <FontIcon value='file_upload' />
        }
        <div>
          <span> {t('DRAG_AND_DROP_TO_UPLOAD')} </span>
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
    const t = this.props.t
    const crop = this.state.crop
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
                  <Button icon='save' raised label={t('IMG_FORM_SAVE_CROP')} primary onClick={this.saveCropped} disabled={!crop.width || !crop.height} /> &nbsp;
                  <Button icon='clear' raised label={t('IMG_FORM_CANCEL_CROP')} className={RTButtonTheme.danger} onClick={() => this.setState({cropMode: false})} />
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
  label: PropTypes.string,
  size: PropTypes.object
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

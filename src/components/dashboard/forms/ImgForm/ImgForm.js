import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Img from 'components/common/img/Img'
// import debounce from 'debounce'
import Dropzone from 'react-dropzone'
import Translate from 'components/translate/Translate'
import Button from '@material-ui/core/Button'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import ReactCrop from 'react-image-crop'
import { getCroppedImgUrl } from 'services/images/crop'
import CropIcon from '@material-ui/icons/Crop'
import ClearIcon from '@material-ui/icons/Clear'
import SaveIcon from '@material-ui/icons/Save'
import FileUploadIcon from '@material-ui/icons/CloudUpload'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class ImgForm extends Component {

  constructor(props) {
    super(props)

    const aspect = props.size ? (this.props.size.width / this.props.size.height) : undefined

    this.state = {
      imgSrc: props.imgSrc || '',
      imgName: '',
      cropMode: false,
      crop: { aspect: aspect }
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
    this.preventBubbling(e)

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
    getCroppedImgUrl({ objUrl: this.state.imgSrc, pixelCrop: this.state.crop, fileName: 'image', size: this.props.size })
      .then((croppedBlob) => {
        URL.revokeObjectURL(this.state.imgSrc)
        this.setState({ imgSrc: croppedBlob, cropMode: false })
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
    const { t, classes } = this.props
    return (
      <div className={classes.uploadInfo}>
        {this.state.imgSrc ?
          <div className={classes.uploadActions}>
            {/* TEMP: make size required */}
            {!!this.props.size &&
              <Button
                variant='raised'
                color='primary'
                onClick={(e) => {
                  this.preventBubbling(e);
                  this.setState({ cropMode: true })
                }}
                className={classes.dropzoneBtn}
              >
                <CropIcon className={classes.leftIcon} />
                {t('IMG_FORM_CROP')}
              </Button>
            }
            &nbsp;
            <Button
              variant='raised'
              onClick={this.onRemove}
              className={classes.dropzoneBtn}
            >
              <ClearIcon className={classes.leftIcon} />
              {t('IMG_FORM_CLEAR')}
            </Button>
          </div>
          :
          <FileUploadIcon />
        }
        <div>
          <span> {t('DRAG_AND_DROP_TO_UPLOAD')} </span>
        </div>
        <div>
          <small> (max 2MB; .jpeg, .jpg, .png)  </small>
        </div>
        <div>
          <Typography color='error'>
            {this.props.errMsg}
          </Typography>
        </div>
      </div>
    )
  }

  // TODO: CLEAR IMG BLOB!!!!
  render() {
    const { t, classes } = this.props
    const crop = this.state.crop

    return (
      <div
        className={classes.imgForm}
      >
        <AppBar
          position='static'
          color='default'
          classes={{
            root: classes.header
          }}
        >
          <Toolbar>

            {this.state.imgSrc && this.state.imgName ?
              <span> {this.props.label || 'Image'}: {this.state.imgName} </span>
              :
              <span> {this.props.label || 'Upload image'} </span>
            }
          </Toolbar>

        </AppBar>
        <div>

          {this.state.cropMode ?
            <div
              className={classes.dropzone}
              onClick={this.preventBubbling}
            >
              <div
                className={classes.droppedImgContainer}
              >
                <ReactCrop
                  style={{ maxWidth: '70%', maxHeight: 176 }}
                  imageStyle={{ maxWidth: '100%', maxHeight: '176px', width: 'auto', height: 'auto' }}
                  className={classes.imgDropzonePreview}
                  crop={this.state.crop}
                  src={this.state.imgSrc || ''}
                  onChange={this.onCropChange}
                />
                <div>
                  <Typography color='primary' gutterBottom>
                    {t('CROP_MODE_MSG')}
                  </Typography>
                  <Button
                    variant='raised'
                    color='primary'
                    onClick={this.saveCropped}
                    disabled={!crop.width || !crop.height}
                    className={classes.dropzoneBtn}
                  >
                    <SaveIcon className={classes.leftIcon} />
                    {t('IMG_FORM_SAVE_CROP')}
                  </Button>
                  <Button
                    variant='raised'
                    onClick={() => this.setState({ cropMode: false })}
                    className={classes.dropzoneBtn}
                  >
                    <ClearIcon className={classes.leftIcon} />
                    {t('IMG_FORM_CANCEL_CROP')}
                  </Button >
                </div>
              </div>
            </div>
            :
            <Dropzone
              accept='.jpeg,.jpg,.png'
              onDrop={this.onDrop}
              className={classes.dropzone} >
              <div
                className={classes.droppedImgContainer}
              >
                <Img
                  src={this.state.imgSrc}
                  alt={'name'}
                  className={classes.imgDropzonePreview}
                />
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
)(Translate(withStyles(styles)(ImgForm)))

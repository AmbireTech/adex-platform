import React, { Component } from 'react'
import PropTypes from 'prop-types'
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
		const { size } = props
		const aspect = size
			? (size.width / size.height)
			: undefined

		this.state = {
			imgSrc: props.imgSrc || '',
			mime: '',
			imgName: '',
			cropMode: false,
			crop: { aspect: aspect }
		}
	}

	onDrop = (acceptedFiles, rejectedFiles) => {
		const that = this
		const file = acceptedFiles[0]
		if (!file) return
		const objectUrl = URL.createObjectURL(file)

		that.setState({
			imgSrc: objectUrl,
			imgName: file.name,
			mime: file.type
		})
		// TODO: Maybe get width and height here instead on ing validation hoc
		this.props.onChange({
			tempUrl: objectUrl,
			mime: file.type
		})
	}

	onRemove = (e) => {
		this.preventBubbling(e)

		const { imgSrc } = this.state

		if (imgSrc) {
			URL.revokeObjectURL(imgSrc)
			this.setState({ imgSrc: '', imgName: '' })
			this.props.onChange({ tempUrl: null, mime: null })
		}
	}

	onCropChange = (crop) => {
		this.setState({ crop });
	}

	saveCropped = () => {
		const { imgSrc, crop, mime, imgName } = this.state
		const { onChange, size } = this.props
		getCroppedImgUrl({
			objUrl: imgSrc,
			pixelCrop: crop,
			fileName: `cropped-${imgName}`,
			size
		})
			.then((croppedBlob) => {
				URL.revokeObjectURL(imgSrc)
				this.setState({ imgSrc: croppedBlob, cropMode: false })
				onChange({
					tempUrl: croppedBlob,
					mime
				})
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
		const { t, classes, size, errMsg } = this.props
		const { imgSrc } = this.state
		return (
			<div className={classes.uploadInfo}>
				{imgSrc ?
					<div className={classes.uploadActions}>
						{/* TEMP: make size required */}
						{!!size &&
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
					<small> (max 2MB; .jpeg, .jpg)  </small>
				</div>
				<div>
					<Typography className={classes.errMsg} color='error'>
						{errMsg}
					</Typography>
				</div>
			</div>
		)
	}

	// TODO: CLEAR IMG BLOB!!!!
	render() {
		const {
			t,
			classes,
			label,
			additionalInfo
		} = this.props
		const {
			crop,
			cropMode,
			imgName,
			imgSrc
		} = this.state

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

						{imgSrc && imgName ?
							<span>
								{label || 'Image'}: {imgName}
							</span>
							:
							<span> {label || 'Upload image'} </span>
						}
					</Toolbar>

				</AppBar>
				<div>

					{cropMode ?
						<div
							className={classes.dropzone}
							onClick={this.preventBubbling}
						>
							<div
								className={classes.droppedImgContainer}
							>
								<ReactCrop
									style={{ maxWidth: '70%', maxHeight: 320 }}
									imageStyle={{
										maxWidth: '100%',
										maxHeight: '320px',
										width: 'auto',
										height: 'auto'
									}}
									className={classes.imgDropzonePreview}
									crop={crop}
									src={imgSrc || ''}
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
							accept='.jpeg,.jpg'
							onDrop={this.onDrop}
							className={classes.dropzone} >
							<div
								className={classes.droppedImgContainer}
							>
								<Img
									src={imgSrc}
									alt={'name'}
									className={classes.imgDropzonePreview}
								/>
								<this.UploadInfo />
							</div>
						</Dropzone>
					}

				</div>
				<div>
					<small> {additionalInfo} </small>
				</div>
			</div>
		)
	}
}

ImgForm.propTypes = {
	imgSrc: PropTypes.string,
	label: PropTypes.string,
	size: PropTypes.object
}

export default Translate(withStyles(styles)(ImgForm))

import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import Media from 'components/common/media'

// import debounce from 'debounce'
import Dropzone from 'react-dropzone'
import { Button, Typography, Grid, Box } from '@material-ui/core'
import ReactCrop from 'react-image-crop'
import { getCroppedImgUrl } from 'services/images/crop'
import {
	Crop as CropIcon,
	Clear as ClearIcon,
	Save as SaveIcon,
	CloudUpload as FileUploadIcon,
} from '@material-ui/icons'
import { isVideoMedia } from 'helpers/mediaHelpers.js'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import OutlinedPropView from 'components/common/OutlinedPropView'
import { t } from 'selectors'

const useStyles = makeStyles(styles)

function ImgForm(props) {
	const classes = useStyles()
	const { size, onChange, label, additionalInfo, errMsg } = props
	const aspect = size ? size.width / size.height : undefined

	const [imgRef, setImgRef] = useState(null)
	const [crop, setCrop] = useState({ aspect })
	const [cropMode, setCropMode] = useState(false)
	const [imgName, setImgName] = useState('')
	const [mime, setMime] = useState(props.mime)
	const [imgSrc, setImgSrc] = useState(props.imgSrc)
	const [isVideoSrc, setIsVideoSrc] = useState(isVideoMedia(props.mime))

	useEffect(() => {
		setCrop({ aspect })
	}, [aspect])

	useEffect(() => {
		setMime(props.mime)
		setImgSrc(props.imgSrc)
		setIsVideoSrc(isVideoMedia(props.mime))
	}, [props.mime, props.imgSrc])

	const onLoad = useCallback(img => {
		setImgRef(img)
	}, [])

	const onDrop = (acceptedFiles, rejectedFiles) => {
		const file = acceptedFiles[0]
		if (!file) return
		const objectUrl = URL.createObjectURL(file)
		setMime(file.type)
		setImgName(file.name)
		setIsVideoSrc(isVideoMedia(file.mime))
		setImgSrc(objectUrl)

		// TODO: Maybe get width and height here instead on ing validation hoc
		onChange({
			tempUrl: objectUrl,
			mime: file.type,
		})
	}

	const preventBubbling = e => {
		if (e.stopPropagation) {
			e.stopPropagation()
		}
		if (e.nativeEvent) {
			e.nativeEvent.stopImmediatePropagation()
		}
	}

	const onRemove = e => {
		preventBubbling(e)

		if (imgSrc) {
			URL.revokeObjectURL(imgSrc)
			setImgSrc('')
			setImgName('')
			onChange({ tempUrl: null, mime: null })
		}
	}

	const saveCropped = async () => {
		if (imgRef && crop.width > 1 && crop.height > 1) {
			const croppedBlob = await getCroppedImgUrl(
				imgRef,
				crop,
				`cropped-${imgName}`,
				size
			)
			URL.revokeObjectURL(imgSrc)
			setIsVideoSrc(false)
			setImgSrc(croppedBlob)
			setCropMode(false)
			onChange({
				tempUrl: croppedBlob,
				mime,
			})
		} else {
			// TODO: Error
		}
	}

	const UploadInfo = () => {
		return (
			<div className={classes.uploadInfo}>
				{imgSrc && !isVideoMedia(mime) ? (
					<div className={classes.uploadActions}>
						{/* TEMP: make size required */}
						{!!size && (
							<Button
								variant='contained'
								color='primary'
								onClick={e => {
									preventBubbling(e)
									setCropMode(true)
								}}
								className={classes.dropzoneBtn}
							>
								<CropIcon className={classes.leftIcon} />
								{t('IMG_FORM_CROP')}
							</Button>
						)}
						&nbsp;
						<Button
							variant='contained'
							onClick={onRemove}
							className={classes.dropzoneBtn}
						>
							<ClearIcon className={classes.leftIcon} />
							{t('IMG_FORM_CLEAR')}
						</Button>
					</div>
				) : (
					<FileUploadIcon />
				)}
				<div>
					<span> {t('DRAG_AND_DROP_TO_UPLOAD')} </span>
				</div>
				<div>
					<small> (max 2MB; .jpeg, .jpg, .png, .mp4) </small>
				</div>
				<div>
					<Typography className={classes.errMsg} color='error'>
						{errMsg}
					</Typography>
				</div>
			</div>
		)
	}

	return (
		<div className={classes.imgForm}>
			<OutlinedPropView
				label={
					imgSrc && imgName
						? `${label || 'Image'}: ${imgName}`
						: label || 'Upload image'
				}
				value={
					<div>
						<div>
							{cropMode ? (
								<div className={classes.dropzone} onClick={preventBubbling}>
									<Grid
										container
										spacing={2}
										alignContent='center'
										alignItems='center'
									>
										<Grid item sm={12} md={8}>
											<Box className={classes.imgDropzonePreview}>
												<ReactCrop
													imageStyle={{
														maxWidth: '100%',
														maxHeight: '30vh',
													}}
													onImageLoaded={onLoad}
													crop={crop}
													src={imgSrc || ''}
													onChange={c => setCrop(c)}
												/>
											</Box>
										</Grid>

										<Grid item sm={12} md={4}>
											<Typography color='primary' gutterBottom>
												{t('CROP_MODE_MSG')}
											</Typography>
											<Button
												variant='contained'
												color='primary'
												onClick={saveCropped}
												disabled={!crop.width || !crop.height}
												className={classes.dropzoneBtn}
											>
												<SaveIcon className={classes.leftIcon} />
												{t('IMG_FORM_SAVE_CROP')}
											</Button>
											<Button
												variant='contained'
												onClick={() => setCropMode(false)}
												className={classes.dropzoneBtn}
											>
												<ClearIcon className={classes.leftIcon} />
												{t('IMG_FORM_CANCEL_CROP')}
											</Button>
										</Grid>
									</Grid>
								</div>
							) : (
								<Dropzone
									accept='.jpeg,.jpg,.png,.mp4'
									onDrop={onDrop}
									className={classes.dropzone}
								>
									<Grid
										container
										spacing={2}
										alignContent='center'
										alignItems='center'
									>
										<Grid item sm={12} md={8}>
											<Box className={classes.imgDropzonePreview}>
												<Media
													src={imgSrc}
													alt={imgName || 'media'}
													mediaMime={mime}
													controls={isVideoSrc}
													allowVideo={isVideoSrc}
												/>
											</Box>
										</Grid>
										<Grid item sm={12} md={4}>
											<UploadInfo />
										</Grid>
									</Grid>
								</Dropzone>
							)}
						</div>
						<div>
							<small> {additionalInfo} </small>
						</div>
					</div>
				}
			/>
		</div>
	)
}

ImgForm.propTypes = {
	label: PropTypes.string,
	size: PropTypes.object,
}

export default ImgForm

import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import Media from 'components/common/media'
import { Button, Typography, Grid, Box } from '@material-ui/core'
import { Alert, AlertTitle } from '@material-ui/lab'
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
import OutlinedPropView from 'components/common/OutlinedPropView'
import { t } from 'selectors'
import { useDropzone } from 'react-dropzone'

const styles = theme => {
	const spacing = theme.spacing(1)
	return {
		dropzone: {
			marginBottom: spacing,
			display: 'flex',
			flexDirection: 'column',
			flex: '1 1',
			height: 'auto',
			width: 'auto',
			border: ({ isDragActive, isDragAccept, isDragReject }) =>
				`1px dashed ${
					isDragActive
						? theme.palette.secondary.main
						: isDragAccept
						? theme.palette.success.main
						: isDragReject
						? theme.palette.error.main
						: theme.palette.grey.main
				}`,
			background: theme.palette.background.default,
			padding: 10,
			cursor: 'pointer',
			overflow: 'hidden',
			transition: 'border .24s ease-in-out',
		},
		cropzone: {
			marginBottom: spacing,
			display: 'flex',
			flexDirection: 'column',
			flex: '1 1',
			height: 'auto',
			width: 'auto',
			background: theme.palette.primary.main,
			padding: 10,
			overflow: 'hidden',
		},
		imgDropzonePreview: {
			height: 320,
			width: 'auto',
			maxWidth: '100%',
			maxHeight: '30vh',
			display: 'flex',
			alignItems: 'center',
			flexDirection: 'column',
			justifyContent: 'center',
		},
		dropzoneBtn: {
			marginBottom: spacing,
			marginRight: spacing,
		},
		leftIcon: {
			marginRight: spacing,
		},
		uploadActions: {
			marginTop: spacing,
		},
	}
}

const useStyles = makeStyles(styles)

function MediaForm({
	size,
	onChange,
	label,
	additionalInfo,
	errMsg,
	src,
	mime: propsMime,
}) {
	const {
		acceptedFiles,
		fileRejections,
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject,
	} = useDropzone({
		accept: 'image/jpeg, image/jpg, image/png, video/mp4',
		maxSize: 1042069,
		maxFiles: 1,
		multiple: false,
		noDragEventsBubbling: true,
	})

	const classes = useStyles({
		isDragActive,
		isDragAccept,
		isDragReject,
	})

	const aspect = size ? size.width / size.height : undefined

	const [imgRef, setImgRef] = useState(null)
	const [crop, setCrop] = useState({ aspect })
	const [cropMode, setCropMode] = useState(false)
	const [mediaName, setMediaName] = useState('')
	const [mime, setMime] = useState(propsMime)
	const [mediaSrc, setMediaSrc] = useState(src)
	const [isVideoSrc, setIsVideoSrc] = useState(isVideoMedia(propsMime))

	useEffect(() => {
		setCrop({ aspect })
	}, [aspect])

	useEffect(() => {
		setMime(propsMime)
		setMediaSrc(src)
		setIsVideoSrc(isVideoMedia(propsMime))
	}, [propsMime, src])

	const onLoad = useCallback(img => {
		setImgRef(img)
	}, [])

	const clearMedia = useCallback(() => {
		if (mediaSrc) {
			URL.revokeObjectURL(mediaSrc)
			setMediaSrc('')
			setMediaName('')
			onChange({ tempUrl: null, mime: null })
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mediaSrc])

	useEffect(() => {
		if (fileRejections && fileRejections.length) {
			clearMedia()
		}
	}, [clearMedia, fileRejections])

	useEffect(() => {
		const file = acceptedFiles[0]
		if (!file) return
		const objectUrl = URL.createObjectURL(file)
		setMime(file.type)
		setMediaName(file.name)
		setIsVideoSrc(isVideoMedia(file.mime))
		setMediaSrc(objectUrl)

		// TODO: Maybe get width and height here instead on ing validation hoc
		onChange({
			tempUrl: objectUrl,
			mime: file.type,
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [acceptedFiles])

	const saveCropped = async () => {
		if (imgRef && crop.width > 1 && crop.height > 1) {
			const croppedBlob = await getCroppedImgUrl(
				imgRef,
				crop,
				`cropped-${mediaName}`,
				size
			)
			URL.revokeObjectURL(mediaSrc)
			setIsVideoSrc(false)
			setMediaSrc(croppedBlob)
			setCropMode(false)
			onChange({
				tempUrl: croppedBlob,
				mime,
			})
		} else {
			// TODO: Error
		}
	}

	return (
		<Box>
			<OutlinedPropView
				autoFocus={false}
				label={
					mediaSrc && mediaName
						? `${label || 'Media'}: ${mediaName}`
						: label || 'Upload media'
				}
				value={
					<Box>
						<Box>
							{cropMode ? (
								<Grid
									container
									spacing={2}
									alignContent='center'
									alignItems='center'
								>
									<Grid item sm={12} md={8}>
										<Box className={classes.cropzone}>
											<Box className={classes.imgDropzonePreview}>
												<ReactCrop
													imageStyle={{
														maxWidth: '100%',
														maxHeight: '30vh',
													}}
													onImageLoaded={onLoad}
													crop={crop}
													src={mediaSrc || ''}
													onChange={c => setCrop(c)}
												/>
											</Box>
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
							) : (
								<Grid
									container
									spacing={2}
									alignContent='center'
									alignItems='center'
								>
									<Grid item sm={12} md={8}>
										<Box {...getRootProps({ className: classes.dropzone })}>
											<Box className={classes.imgDropzonePreview}>
												{mediaSrc ? (
													<Media
														src={mediaSrc}
														alt={mediaName || 'media'}
														mediaMime={mime}
														// controls={isVideoSrc}
														allowVideo={isVideoSrc}
													/>
												) : (
													<Box
														display='flex'
														alignItems='center'
														flexDirection='column'
													>
														<FileUploadIcon />
														<Box>
															<Typography>
																{t('DRAG_AND_DROP_TO_UPLOAD')}{' '}
															</Typography>
														</Box>
														<Box>
															<Typography>
																(max 1MB; .jpeg, .jpg, .png, .mp4){' '}
															</Typography>
														</Box>
													</Box>
												)}
											</Box>
											<input {...getInputProps()} />
										</Box>
									</Grid>
									<Grid item sm={12} md={4}>
										<Box>
											{mediaSrc && !isVideoMedia(mime) && (
												<Box className={classes.uploadActions}>
													{/* TEMP: make size required */}
													{!!size && (
														<Button
															variant='contained'
															color='primary'
															onClick={() => {
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
														onClick={clearMedia}
														className={classes.dropzoneBtn}
													>
														<ClearIcon className={classes.leftIcon} />
														{t('IMG_FORM_CLEAR')}
													</Button>
												</Box>
											)}

											<Box>
												{fileRejections.map(({ file, errors }) => (
													<Alert key={file.path} severity='error'>
														<AlertTitle>
															{file.path} - {file.size} bytes
														</AlertTitle>
														{errors.map(e => (
															// TODO: translate errors
															<Box key={e.code}>{e.message}</Box>
														))}
													</Alert>
												))}
												<Typography className={classes.errMsg} color='error'>
													{errMsg}
												</Typography>
											</Box>
										</Box>
									</Grid>
								</Grid>
							)}
						</Box>
						<Box>
							<Typography variant='caption'> {additionalInfo} </Typography>
						</Box>
					</Box>
				}
			/>
		</Box>
	)
}

MediaForm.propTypes = {
	label: PropTypes.string,
	size: PropTypes.object,
}

export default MediaForm

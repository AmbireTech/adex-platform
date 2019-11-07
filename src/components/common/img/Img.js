import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NO_IMAGE from 'resources/no-image-box-eddie.jpg'
import VIDEO_IMAGE from 'resources/video-placeholder.jpg'
import CircularProgress from '@material-ui/core/CircularProgress'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import FullscreenIcon from '@material-ui/icons/Fullscreen'
// import IconButton from '@material-ui/core/IconButton'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import Translate from 'components/translate/Translate'
import { validations, helpers } from 'adex-models'
import { isVideoMedia } from 'helpers/mediaHelpers.js'

const MAX_IMG_LOAD_TIME = 7000
class Img extends Component {
	constructor(props) {
		super(props)
		this.state = {
			imgSrc: null,
			active: false,
			videoSrc: null,
		}

		this.setDisplayImage = this.setDisplayImage.bind(this)
		this.setDisplayVideo = this.setDisplayVideo.bind(this)
		this.loadTimeout = null
	}

	ipfsSrc = src => {
		if (!!src && validations.Regexes.ipfsRegex.test(src)) {
			return helpers.getMediaUrlWithProvider(src, process.env.IPFS_GATEWAY)
		}

		return src
	}

	handleToggle = () => {
		let active = this.state.active
		this.setState({ active: !active })
	}

	componentDidMount() {
		const { src, fallbackSrc, mediaMime, allowVideo } = this.props
		const isVideo = !!mediaMime && isVideoMedia(mediaMime)

		if (isVideo && !allowVideo) {
			return this.setState({
				imgSrc: VIDEO_IMAGE,
			})
		}

		if (isVideo) {
			this.displayVideo = document.createElement('video')
			this.setDisplayVideo({
				image: this.ipfsSrc(src),
				fallback: this.ipfsSrc(fallbackSrc) || NO_IMAGE,
			})
		} else {
			this.displayImage = new Image()
			this.setDisplayImage({
				image: this.ipfsSrc(src),
				fallback: this.ipfsSrc(fallbackSrc) || NO_IMAGE,
			})
		}
	}

	componentWillReceiveProps = nextProps => {
		const nextSrc = this.ipfsSrc(nextProps.src)
		const thisSrc = this.ipfsSrc(this.props.src)
		const nextFallback = this.ipfsSrc(nextProps.fallbackSrc)
		const { mediaMime } = nextProps

		if (nextSrc !== thisSrc) {
			const isVideo = !!mediaMime && isVideoMedia(mediaMime)

			if (isVideo) {
				this.displayVideo = this.displayVideo || document.createElement('video')
				this.setDisplayVideo({
					image: this.ipfsSrc(nextSrc),
					fallback: this.ipfsSrc(nextFallback) || NO_IMAGE,
				})
			} else {
				this.displayImage = this.displayImage || new Image()
				this.setDisplayImage({
					image: this.ipfsSrc(nextSrc),
					fallback: this.ipfsSrc(nextFallback) || NO_IMAGE,
				})
			}
		}
	}

	componentWillUnmount() {
		this.clearLoadTimeout()
		if (this.displayImage) {
			this.displayImage.onerror = null
			this.displayImage.onload = null
			this.displayImage.onabort = null
			this.displayImage = null
		}
	}

	clearLoadTimeout = () => {
		if (this.loadTimeout) {
			clearTimeout(this.loadTimeout)
			this.loadTimeout = null
		}
	}

	onFail = fallback => {
		if (this.displayImage) {
			this.displayImage.onerror = null
			this.displayImage.onload = null
			this.displayImage.onabort = null

			this.clearLoadTimeout()
			this.displayImage.src = fallback
		}

		this.clearLoadTimeout()

		this.setState({
			imgSrc: fallback || null,
		})
	}

	setDisplayImage = ({ image, fallback }) => {
		this.loadTimeout = setTimeout(() => {
			this.onFail(fallback)
		}, MAX_IMG_LOAD_TIME)

		this.displayImage.onerror = this.displayImage.onabort = this.onFail.bind(
			this,
			fallback
		)

		this.displayImage.onload = () => {
			this.clearLoadTimeout()
			this.setState({
				imgSrc: image,
			})
		}

		this.displayImage.src = image
	}

	setDisplayVideo = ({ image, fallback }) => {
		this.displayVideo.src = image

		this.loadTimeout = setTimeout(() => {
			this.onFail(fallback)
		}, MAX_IMG_LOAD_TIME)

		this.displayVideo.onloadedmetadata = ({ target }) => {
			this.clearLoadTimeout()
			this.setState({
				videoSrc: image,
			})
		}
	}

	fullScreenBtn() {
		const { classes } = this.props
		return (
			<span>
				<Fab
					mini
					color='default'
					className={classnames(classes.fullscreenIcon)}
					onClick={() => {
						this.handleToggle()
					}}
				>
					<FullscreenIcon />
				</Fab>
				{this.renderFullscreenDialog()}
			</span>
		)
	}

	renderFullscreenDialog() {
		const { t, alt, classes, type } = this.props
		const { active, imgSrc, videoSrc } = this.state

		return (
			<Dialog
				open={active}
				type={type || 'normal'}
				maxWidth={false}
				onClose={this.handleToggle}
				classes={{ paper: classes.dialog }}
			>
				<DialogContent className={classes.dialogImageParent}>
					{imgSrc ? (
						<img
							alt={alt}
							src={imgSrc}
							draggable='false'
							className={classnames(classes.dialogImage, classes.imgLoading)}
							onDragStart={event => event.preventDefault() /*Firefox*/}
						/>
					) : (
						<video
							src={videoSrc}
							autoPlay
							muted
							loop
							controls
							className={classnames(classes.dialogImage, classes.imgLoading)}
						></video>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleToggle} color='primary'>
						{t('CLOSE')}
					</Button>
				</DialogActions>
			</Dialog>
		)
	}

	render() {
		const {
			alt,
			allowFullscreen,
			className,
			classes,
			fullScreenOnClick,
		} = this.props
		const { imgSrc, videoSrc } = this.state
		return imgSrc || videoSrc ? (
			<div
				className={classnames(classes.imgParent, className, classes.wrapper)}
			>
				{!!imgSrc ? (
					<img
						alt={alt}
						src={this.state.imgSrc}
						draggable='false'
						className={classnames(classes.imgLoading, className, classes.img)}
						onDragStart={event => event.preventDefault() /*Firefox*/}
						onClick={
							fullScreenOnClick &&
							(() => {
								this.handleToggle()
							})
						}
					/>
				) : (
					<video
						src={videoSrc}
						className={classnames(classes.imgLoading, className, classes.img)}
						autoPlay
						muted
						loop
						onClick={
							fullScreenOnClick &&
							(() => {
								this.handleToggle()
							})
						}
					></video>
				)}
				{allowFullscreen && this.fullScreenBtn()}
				{fullScreenOnClick && this.renderFullscreenDialog()}
			</div>
		) : (
			<span className={classnames(classes.imgLoading, className)}>
				<span className={classes.circular}>
					<CircularProgress />
				</span>
			</span>
		)
	}
}

Img.propTypes = {
	src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	fallbackSrc: PropTypes.string,
	alt: PropTypes.string,
	allowFullscreen: PropTypes.bool,
	fullScreenOnClick: PropTypes.bool,
	mediaMime: PropTypes.string,
}

export default Translate(withStyles(styles)(Img))

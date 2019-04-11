import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NO_IMAGE from 'resources/no-image-box-eddie.jpg'
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
import Translate from 'components/translate/Translate'
import { validations, helpers } from 'adex-models'

const MAX_IMG_LOAD_TIME = 3000
class Img extends Component {

	constructor(props) {
		super(props)
		this.state = {
			imgSrc: null,
			active: false
		}

		this.setDisplayImage = this.setDisplayImage.bind(this)
		this.loadTimeout = null
	}

	ipfsSrc = (src) => {
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
		this.displayImage = new Image()
		this.setDisplayImage({
			image: this.ipfsSrc(this.props.src),
			fallback: this.ipfsSrc(this.props.fallbackSrc) || NO_IMAGE
		})
	}

	componentWillReceiveProps = (nextProps) => {
		const nextSrc = this.ipfsSrc(nextProps.src)
		const thisSrc = this.ipfsSrc(this.props.src)
		const nextFallback = this.ipfsSrc(nextProps.fallbackSrc)

		if (nextSrc !== thisSrc) {
			this.setDisplayImage({
				image: this.ipfsSrc(nextSrc),
				fallback: nextFallback || NO_IMAGE
			})
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

	onFail = (fallback) => {
		if (this.displayImage) {
			this.displayImage.onerror = null
			this.displayImage.onload = null
			this.displayImage.onabort = null

			this.clearLoadTimeout()
			this.displayImage.src = fallback
		}

		this.clearLoadTimeout()

		this.setState({
			imgSrc: fallback || null
		})
	}

	setDisplayImage = ({ image, fallback }) => {
		this.loadTimeout = setTimeout(() => {
			this.onFail(fallback)
		}, MAX_IMG_LOAD_TIME)

		this.displayImage.onerror = this.displayImage.onabort = this.onFail.bind(this, fallback)

		this.displayImage.onload = () => {
			this.clearLoadTimeout()
			this.setState({
				imgSrc: image
			})
		}

		this.displayImage.src = image
	}

	renderFullscreenDialog() {
		const { allowFullscreen, className, alt, classes, t, ...other } = this.props

		return (
			<span>
				<Button
					variant='fab'
					mini
					color='default'
					className={classnames(classes.fullscreenIcon)}
					onClick={() => { this.handleToggle() }}
				>
					<FullscreenIcon />
				</Button>
				<Dialog
					open={this.state.active}
					type={this.props.type || 'normal'}
					maxWidth={false}
					onClose={this.handleToggle}
					classes={{ paper: classes.dialog }}
				>
					<DialogContent className={classes.dialogImageParent}>
						<img
							{...other}
							alt={alt}
							src={this.state.imgSrc}
							draggable='false'
							className={classnames(classes.dialogImage, classes.imgLoading)}
							onDragStart={(event) => event.preventDefault() /*Firefox*/}
						/>
					</DialogContent>
					<DialogActions>
						<Button
							onClick={this.handleToggle}
							color='primary'
						>
							{t('CLOSE')}
						</Button>
					</DialogActions>
				</Dialog>
			</span>
		)
	}

	render() {
		const { alt, allowFullscreen, className, classes, t, ...other } = this.props
		return (
			this.state.imgSrc ?
				<span className={classnames(classes.imgParent, className)}>
					<img
						{...other}
						alt={alt}
						src={this.state.imgSrc}
						draggable='false'
						className={classnames(classes.imgLoading, className)}
						onDragStart={(event) => event.preventDefault() /*Firefox*/}
					/>
					{allowFullscreen ? this.renderFullscreenDialog() : null}
				</span>
				:
				<span className={classnames(classes.imgLoading, className)}>
					<span
						className={classes.circular}
					>
						<CircularProgress />
					</span>
				</span>
		)
	}
}

Img.propTypes = {
	src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
	fallbackSrc: PropTypes.string,
	alt: PropTypes.string
}

export default Translate(withStyles(styles)(Img))

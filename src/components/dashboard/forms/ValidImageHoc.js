import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import { isVideoMedia } from 'helpers/mediaHelpers.js'

// Allow higher res images with same aspect ratio
function checkExactish(widthTarget, width, heightTarget, height) {
	const targetAspect = parseFloat(widthTarget / heightTarget).toFixed(2)
	const aspect = parseFloat(width / height).toFixed(2)

	const isValid =
		widthTarget <= width && heightTarget <= height && targetAspect === aspect

	return isValid
}

export default function ValidImageHoc(Decorated) {
	class ValidImage extends Component {
		validate = ({
			propsName,
			widthTarget,
			heightTarget,
			mediaWidth,
			mediaHeight,
			msg,
			exact,
			required,
			onChange,
			mime,
			tempUrl,
		}) => {
			let isValid = true

			if (exact) {
				isValid = checkExactish(
					widthTarget,
					mediaWidth,
					heightTarget,
					mediaHeight
				)
			}

			if (!exact && (widthTarget < mediaWidth || heightTarget < mediaHeight)) {
				isValid = false
			}

			const masgArgs = [widthTarget, heightTarget, 'px']

			this.props.validate(propsName, {
				isValid: isValid,
				err: { msg: msg, args: masgArgs },
				dirty: true,
			})

			const resMedia = {
				width: mediaWidth,
				height: mediaHeight,
				mime,
				tempUrl,
			}

			if (typeof onChange === 'function') {
				onChange(propsName, resMedia)
			}
		}

		getVideoSize = src =>
			new Promise(resolve => {
				const video = document.createElement('video')
				video.src = src.tempUrl

				video.onloadedmetadata = ({ target }) => {
					return resolve({
						width: target.videoWidth,
						height: target.videoHeight,
					})
				}
			})

		getImageSize = src =>
			new Promise(resolve => {
				const image = new Image()
				image.src = src.tempUrl

				image.onload = function() {
					return resolve({
						width: this.width,
						height: this.height,
					})
				}
			})

		validateMedia = async (
			{
				propsName,
				widthTarget,
				heightTarget,
				msg,
				exact,
				required,
				onChange,
			} = {},
			media
		) => {
			if (!required && !media.tempUrl && onChange) {
				this.props.validate(propsName, {
					isValid: true,
					err: { msg: msg, args: [] },
					dirty: true,
				})
				// TODO: fix this
				onChange(propsName, media)
				return
			}

			const getSize = isVideoMedia(media.mime)
				? () => this.getVideoSize(media)
				: () => this.getImageSize(media)

			const size = await getSize()

			this.validate({
				propsName,
				widthTarget,
				heightTarget,
				mediaWidth: size.width,
				mediaHeight: size.height,
				msg,
				exact,
				required,
				onChange,
				mime: media.mime,
				tempUrl: media.tempUrl,
			})
		}

		render() {
			const props = this.props
			return <Decorated {...props} validateMedia={this.validateMedia} />
		}
	}

	ValidImage.propTypes = {
		actions: PropTypes.object.isRequired,
		validateId: PropTypes.string.isRequired,
	}

	function mapStateToProps(state, props) {
		const { memory } = state
		return {
			validations: memory.validations[props.validateId],
		}
	}

	function mapDispatchToProps(dispatch) {
		return {
			actions: bindActionCreators(actions, dispatch),
		}
	}

	return connect(
		mapStateToProps,
		mapDispatchToProps
	)(Translate(ValidImage))
}

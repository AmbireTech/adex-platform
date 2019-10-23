import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import { getMediaSize, checkExactishAspect } from 'helpers/mediaHelpers'

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
				isValid = checkExactishAspect(
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

			if (!media.mime || !media.tempUrl) {
				this.props.validate(propsName, {
					isValid: false,
					dirty: true,
				})
				return
			}

			const size = await getMediaSize({ mime: media.mime, src: media.tempUrl })

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

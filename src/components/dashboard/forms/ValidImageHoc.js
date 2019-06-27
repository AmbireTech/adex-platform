import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'

// Allow higher res images with same aspect ratio
function checkExactish(widthTarget, width, heightTarget, height) {
	const targetAspect = parseFloat(widthTarget / heightTarget).toFixed(5)
	const aspect = parseFloat(width / height).toFixed(5)

	const isValid = (widthTarget <= width) &&
		(heightTarget <= height) &&
		(targetAspect === aspect)

	return isValid
}

export default function ValidImageHoc(Decorated) {

	class ValidImage extends Component {
		validateImg = ({
			propsName,
			widthTarget,
			heightTarget,
			msg,
			exact,
			required,
			onChange
		} = {}, img) => {
			if (!required && !img.tempUrl && onChange) {
				this.props.validate(propsName, { isValid: true, err: { msg: msg, args: [] }, dirty: true })
				// TODO: fix this
				onChange(propsName, img)
				return
			}
			const image = new Image()
			image.src = img.tempUrl
			const that = this

			image.onload = function () {
				const width = this.width
				const height = this.height

				let isValid = true

				if (exact) {
					isValid = checkExactish(widthTarget, width, heightTarget, height)
				}

				if (!exact && (widthTarget < width || heightTarget < height)) {
					isValid = false
				}

				const masgArgs = [widthTarget, heightTarget, 'px']

				that.props.validate(propsName, { isValid: isValid, err: { msg: msg, args: masgArgs }, dirty: true })

				const resImg = {
					width,
					height,
					mime: img.mime,
					tempUrl: img.tempUrl
				}

				if (typeof onChange === 'function') {
					onChange(propsName, resImg)
				}
			}
		}

		render() {
			const props = this.props
			return (
				<Decorated {...props} validateImg={this.validateImg} />
			)
		}
	}

	ValidImage.propTypes = {
		actions: PropTypes.object.isRequired,
		validateId: PropTypes.string.isRequired
	}

	function mapStateToProps(state, props) {
		const { memory } = state
		return {
			validations: memory.validations[props.validateId]
		}
	}

	function mapDispatchToProps(dispatch) {
		return {
			actions: bindActionCreators(actions, dispatch)
		}
	}

	return connect(
		mapStateToProps,
		mapDispatchToProps
	)(Translate(ValidImage))
}


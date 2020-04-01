import { validate } from 'actions'
import { getMediaSize, checkExactishAspect } from 'helpers/mediaHelpers'

export function validateMediaSize({
	validateId,
	media,
	propsName,
	dirty,
	widthTarget,
	heightTarget,
	msg,
	exact,
	required,
} = {}) {
	return async function(dispatch) {
		const { mime, tempUrl } = media
		let isValid = mime && tempUrl

		if (!required && !media.tempUrl) {
			isValid = true
		}

		const size = await getMediaSize({ mime: media.mime, src: media.tempUrl })
		const mediaWidth = size.width
		const mediaHeight = size.height

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

		validate(validateId, propsName, {
			isValid,
			err: { msg, masgArgs },
			dirty,
		})(dispatch)

		return isValid
	}
}

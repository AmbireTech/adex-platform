import { validate } from 'actions'
import { getMediaSize, checkExactishAspect } from 'helpers/mediaHelpers'

export function validateMediaSize({
	validateId,
	media,
	propName,
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
		let args = [widthTarget, heightTarget, 'px']

		if (!required && !media.tempUrl) {
			isValid = true
		}

		if (required && isValid) {
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
		}

		await validate(validateId, propName, {
			isValid,
			err: { msg, args },
			dirty,
		})(dispatch)

		return isValid
	}
}

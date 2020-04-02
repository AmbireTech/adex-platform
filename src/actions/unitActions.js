import {
	updateSpinner,
	handleAfterValidation,
	validateSchemaProp,
	validateMediaSize,
} from 'actions'
import { selectNewAdUnit } from 'selectors'
import { schemas } from 'adex-models'
import { getWidAndHightFromType } from 'helpers/itemsHelpers'

const { adUnitPost } = schemas

export function validateNewUnitBasics({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		try {
			const state = getState()
			const { title, description, type, website } = selectNewAdUnit(state)

			const validations = await Promise.all([
				validateSchemaProp({
					validateId,
					value: title,
					prop: 'title',
					schema: adUnitPost.title,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: description,
					prop: 'description',
					schema: adUnitPost.description,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: type,
					prop: 'type',
					schema: adUnitPost.type,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: website,
					prop: 'targetUrl',
					schema: adUnitPost.targetUrl,
					dirty,
				})(dispatch),
			])

			let isValid = validations.every(v => v === true)

			await handleAfterValidation({ isValid, onValid, onInvalid })
		} catch (err) {}

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function validateNewUnitMedia({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)

		const state = getState()
		const {
			type,
			temp: { tempUrl, mime },
		} = selectNewAdUnit(state)

		const { width, height } = getWidAndHightFromType(type)

		const validations = await Promise.all([
			validateMediaSize({
				validateId,
				dirty,
				propName: 'temp',
				widthTarget: width,
				heightTarget: height,
				msg: 'ERR_IMG_SIZE_EXACT',
				exact: true,
				required: true,
				media: {
					tempUrl,
					mime,
				},
			})(dispatch),
		])

		const isValid = validations.every(v => v === true)

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

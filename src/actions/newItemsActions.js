import {
	updateSpinner,
	updateNewItem,
	handleAfterValidation,
	validateSchemaProp,
	validateNumberString,
} from 'actions'
import { numStringCPMtoImpression } from 'helpers/numbers'
import { selectMainToken, selectNewAdSlot } from 'selectors'
import { AdSlot, schemas } from 'adex-models'

const { adSlotPost } = schemas

export function updateNewSlot(prop, value, newValues) {
	return async function(dispatch, getState) {
		const state = getState()
		const currentSlot = selectNewAdSlot(state)
		await updateNewItem(
			currentSlot,
			newValues || { [prop]: value },
			'AdSlot',
			AdSlot
		)(dispatch)
	}
}

export function validateNewSlotBasics({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)

		const mainToken = selectMainToken()
		const state = getState()
		const slot = selectNewAdSlot(state)
		const { title, description, type, minPerImpression = null } = slot

		const validations = await Promise.all([
			validateSchemaProp({
				validateId,
				value: title,
				prop: 'title',
				schema: adSlotPost.title,
				dirty,
			})(dispatch),
			validateSchemaProp({
				validateId,
				value: description,
				prop: 'description',
				schema: adSlotPost.description,
				dirty,
			})(dispatch),
			validateSchemaProp({
				validateId,
				value: type,
				prop: 'type',
				schema: adSlotPost.type,
				dirty,
			})(dispatch),
			validateNumberString({
				validateId,
				prop: 'minPerImpression',
				value: minPerImpression || '0',
				dirty,
			})(dispatch),
		])

		let isValid = validations.every(v => v === true)

		if (isValid) {
			isValid = await validateSchemaProp({
				validateId,
				value: {
					[mainToken.address]: numStringCPMtoImpression({
						numStr: minPerImpression,
						decimals: mainToken.decimals,
					}),
				},
				prop: 'minPerImpression',
				schema: adSlotPost.minPerImpression,
				dirty,
			})(dispatch)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })

		await updateSpinner(validateId, false)(dispatch)
	}
}

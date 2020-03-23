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
import { verifyWebsite } from 'services/adex-market/actions'

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
		try {
			const mainToken = selectMainToken()
			const state = getState()
			const slot = selectNewAdSlot(state)
			const {
				title,
				description,
				type,
				website,
				minPerImpression = null,
				temp,
			} = slot

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
				validateSchemaProp({
					validateId,
					value: website,
					prop: 'website',
					schema: adSlotPost.website,
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

			const { hostname, issues } = isValid
				? await verifyWebsite({ websiteUrl: website })
				: {}
			const newTemp = { ...temp, hostname, issues }
			updateNewSlot('temp', newTemp)(dispatch, getState)

			await handleAfterValidation({ isValid, onValid, onInvalid })
		} catch (err) {}

		await updateSpinner(validateId, false)(dispatch)
	}
}

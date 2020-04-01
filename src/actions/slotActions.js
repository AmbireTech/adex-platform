import {
	updateSpinner,
	handleAfterValidation,
	validateSchemaProp,
	validateNumberString,
	validateMediaSize,
	updateNewSlot,
	validate,
} from 'actions'
import { numStringCPMtoImpression } from 'helpers/numbers'
import { selectMainToken, selectNewAdSlot } from 'selectors'
import { schemas } from 'adex-models'
import { verifyWebsite } from 'services/adex-market/actions'
import { getWidAndHightFromType } from 'helpers/itemsHelpers'

const { adSlotPost, adUnitPost } = schemas

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

			if (validations[4]) {
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

export function validateNewSlotPassback({
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
			targetUrl,
			temp: { useFallback, tempUrl, mime },
		} = selectNewAdSlot(state)

		const { width, height } = getWidAndHightFromType(type)

		const validations = await Promise.all([
			...(useFallback
				? [
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
				  ]
				: [
						validate(validateId, 'temp', {
							isValid: true,
							dirty,
						})(dispatch),
				  ]),
			...(useFallback
				? [
						validateSchemaProp({
							validateId,
							value: targetUrl,
							prop: 'targetUrl',
							schema: adUnitPost.targetUrl,
							dirty,
						})(dispatch),
				  ]
				: [
						validate(validateId, 'targetUrl', {
							isValid: true,
							dirty,
						})(dispatch),
				  ]),
		])

		const isValid = validations.every(v => v === true)

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

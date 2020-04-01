import {
	UPDATE_NEW_ITEM,
	RESET_NEW_ITEM,
	RESET_ALL_NEW_ITEMS,
} from 'constants/actionTypes'
import {
	updateSpinner,
	handleAfterValidation,
	validateSchemaProp,
	validateNumberString,
} from 'actions'
import { numStringCPMtoImpression } from 'helpers/numbers'
import { selectMainToken, selectNewAdSlot, selectNewItems } from 'selectors'
import { Base, Models, schemas } from 'adex-models'
import { verifyWebsite } from 'services/adex-market/actions'

const { adSlotPost } = schemas

export function updateNewItem(item, newValues, itemType, objModel) {
	item = Base.updateObject({ item, newValues, objModel })
	return function(dispatch) {
		return dispatch({
			type: UPDATE_NEW_ITEM,
			item,
			itemType,
		})
	}
}

export function resetNewItem(item) {
	return function(dispatch) {
		return dispatch({
			type: RESET_NEW_ITEM,
			item: item,
		})
	}
}

export function resetAllNewItems() {
	return function(dispatch) {
		return dispatch({
			type: RESET_ALL_NEW_ITEMS,
		})
	}
}

export function updateNewItemAction(type, prop, value, newValues) {
	return async function(dispatch, getState) {
		const state = getState()
		const currentItem = selectNewItems(state)
		await updateNewItem(
			currentItem[type],
			newValues || { [prop]: value },
			type,
			Models.itemClassByName[type]
		)(dispatch)
	}
}

export function updateNewSlot(prop, value, newValues) {
	return async function(dispatch, getState) {
		await updateNewItemAction('AdSlot', prop, value, newValues)(
			dispatch,
			getState
		)
	}
}

export function updateNewUnit(prop, value, newValues) {
	return async function(dispatch, getState) {
		await updateNewItemAction('AdUnit', prop, value, newValues)(
			dispatch,
			getState
		)
	}
}

export function updateNewCampaign(prop, value, newValues) {
	return async function(dispatch, getState) {
		await updateNewItemAction('Campaign', prop, value, newValues)(
			dispatch,
			getState
		)
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

import {
	UPDATE_NEW_ITEM,
	RESET_NEW_ITEM,
	RESET_ALL_NEW_ITEMS,
} from 'constants/actionTypes'
import { selectNewItemByTypeAndId } from 'selectors'
import { Base, Models } from 'adex-models'
import {
	updateSpinner,
	handleAfterValidation,
	resetTableStateById,
} from 'actions'

import { NEW_CAMPAIGN_UNITS } from 'constants/tables'

export function updateNewItem(item, newValues, itemType, objModel, itemId) {
	if (objModel) {
		item = Base.updateObject({ item, newValues, objModel })
	} else {
		item = {
			...item,
			...newValues,
		}
	}

	return function(dispatch) {
		return dispatch({
			type: UPDATE_NEW_ITEM,
			item,
			itemType,
			itemId,
		})
	}
}

export function resetNewItem(itemType, itemId) {
	return function(dispatch) {
		return dispatch({
			type: RESET_NEW_ITEM,
			itemType,
			itemId,
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

export function updateNewItemAction(type, prop, value, newValues, itemId) {
	return async function(dispatch, getState) {
		const state = getState()
		const currentItem = selectNewItemByTypeAndId(state, type, itemId)
		await updateNewItem(
			currentItem,
			newValues || { [prop]: value },
			type,
			Models.itemClassByName[type],
			itemId
		)(dispatch)
	}
}

export function updateNewSlot(prop, value, newValues, itemId) {
	return async function(dispatch, getState) {
		await updateNewItemAction(
			'AdSlot',
			prop,
			value,
			newValues,
			itemId
		)(dispatch, getState)
	}
}

export function updateNewUnit(prop, value, newValues) {
	return async function(dispatch, getState) {
		await updateNewItemAction(
			'AdUnit',
			prop,
			value,
			newValues
		)(dispatch, getState)
	}
}

export function updateNewCampaign(prop, value, newValues) {
	return async function(dispatch, getState) {
		await updateNewItemAction(
			'Campaign',
			prop,
			value,
			newValues
		)(dispatch, getState)
	}
}

export function updateNewAudience(prop, value, newValues, itemId) {
	return async function(dispatch, getState) {
		await updateNewItemAction(
			'Audience',
			prop,
			value,
			newValues,
			itemId
		)(dispatch, getState)
	}
}

export function updateNewWebsite(prop, value, newValues, itemId) {
	return async function(dispatch, getState) {
		await updateNewItemAction(
			'Website',
			prop,
			value,
			newValues,
			itemId
		)(dispatch, getState)
	}
}

export function updateNewItemTarget({
	collection,
	itemType,
	itemId,
	target = {},
	index,
	remove,
}) {
	return async function(dispatch, getState) {
		const state = getState()
		const { temp } = selectNewItemByTypeAndId(state, itemType, itemId)
		// We are keeping the state in temp because it dirty with extra data
		const targets = [...(temp.targets || [])]
		const hasIndex = Number.isInteger(index)

		if (hasIndex && !remove) {
			// NOTE: when updated with index target has only { target: { tag, score }}
			targets[index] = { ...(targets[index] || {}), ...target }
		} else if (hasIndex && remove) {
			targets.splice(index, 1)
		} else {
			// NOTE: when updated w/o index target has no key
			targets.push({ ...target, key: targets.length })
		}

		// The actual targets added to the spec
		const filtered = targets.filter(x => x.target.tag).map(x => x.target)

		const newValues = {
			[collection]: filtered,
			temp: { ...temp, targets },
		}

		await updateNewItemAction(
			itemType,
			null,
			null,
			newValues,
			itemId
		)(dispatch, getState)
	}
}

export function updateTargetRuleInput({
	parameter,
	itemType,
	itemId,
	target = {},
}) {
	return async function(dispatch, getState) {
		const state = getState()
		const item = selectNewItemByTypeAndId(state, itemType, itemId)
		const isAudience = itemType === 'Audience'

		const newValues = { ...item }

		const newInputs = {
			...(isAudience ? newValues.inputs : newValues.audienceInput.inputs),
		}

		newInputs[parameter] = { ...target }

		if (isAudience) {
			newValues.inputs = newInputs
		} else {
			newValues.audienceInput = {
				version: newValues.audienceInput.version || '1',
				...newValues.audienceInput,
				inputs: newInputs,
			}
		}

		await updateNewItemAction(
			itemType,
			null,
			null,
			newValues,
			itemId
		)(dispatch, getState)
	}
}

export function completeItem({
	itemType,
	competeAction,
	validateId,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		let isValid = false
		try {
			if (competeAction) {
				await competeAction()(dispatch, getState)
			}

			isValid = true
		} catch (err) {
			console.error('ERR_ITEM', err)
		}

		await updateSpinner(validateId, false)(dispatch)

		await handleAfterValidation({ isValid, onValid, onInvalid })
		if (isValid) {
			resetNewItem(itemType)(dispatch)
			if (itemType === 'Campaign') {
				resetTableStateById(NEW_CAMPAIGN_UNITS)(dispatch, getState)
			}
		}
	}
}

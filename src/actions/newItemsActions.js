import {
	UPDATE_NEW_ITEM,
	RESET_NEW_ITEM,
	RESET_ALL_NEW_ITEMS,
} from 'constants/actionTypes'

import { selectNewItems } from 'selectors'
import { Base, Models } from 'adex-models'

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

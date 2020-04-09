import {
	UPDATE_NEW_ITEM,
	RESET_NEW_ITEM,
	RESET_ALL_NEW_ITEMS,
} from 'constants/actionTypes'
import { selectNewItems } from 'selectors'
import { Base, Models } from 'adex-models'
import { updateSpinner, handleAfterValidation } from 'actions'

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

export function updateNewItemTargets({
	collection,
	itemType,
	target = {},
	index,
	remove,
}) {
	return async function(dispatch, getState) {
		const state = getState()
		const { temp } = selectNewItems(state)[itemType]
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

		await updateNewItemAction(itemType, null, null, newValues)(
			dispatch,
			getState
		)
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
			await competeAction()(dispatch, getState)
			isValid = true
		} catch (err) {
			console.error('ERR_ITEM', err)
		}

		await updateSpinner(validateId, false)(dispatch)

		await handleAfterValidation({ isValid, onValid, onInvalid })
		if (isValid) {
			resetNewItem(itemType)(dispatch)
		}
	}
}

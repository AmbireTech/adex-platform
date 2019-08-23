import { UPDATE_NEW_ITEM, RESET_NEW_ITEM } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function newItemsReducer(state = initialState.newItem, action) {
	let newState
	let newItem

	switch (action.type) {
		case UPDATE_NEW_ITEM:
			newState = { ...state }
			newItem = { ...action.item }
			newState[action.itemType] = newItem

			return newState

		case RESET_NEW_ITEM:
			newState = { ...state }
			newItem = { ...initialState.newItem[action.item] }
			newState[action.item] = newItem

			return newState

		default:
			return state
	}
}

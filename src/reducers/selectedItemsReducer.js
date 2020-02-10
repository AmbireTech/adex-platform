import { UPDATE_SELECTED_ITEMS } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function selectedItemsReducer(
	state = initialState.selectedItems,
	action
) {
	let newState

	switch (action.type) {
		case UPDATE_SELECTED_ITEMS:
			newState = { ...state }
			newState = action.selectedItems
			return newState
		default:
			return state
	}
}

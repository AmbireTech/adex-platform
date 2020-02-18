import { UPDATE_SELECTED_CAMPAINGS } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function selectedItemsReducer(
	state = initialState.selectedItems,
	action
) {
	let newState

	switch (action.type) {
		case UPDATE_SELECTED_CAMPAINGS:
			newState = { ...state }
			newState.campaings = action.selectedItems
			return newState
		default:
			return state
	}
}

import { UPDATE_MEMORY_UI } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function uiMemoryReducer(state = initialState.uiMemory, action) {
	let newState
	switch (action.type) {
		case UPDATE_MEMORY_UI:
			newState = { ...state }
			newState[action.item] = action.value
			return newState
		default:
			return state
	}
}

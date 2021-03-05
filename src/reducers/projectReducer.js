import { UPDATE_PROJECT } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function uiReducer(state = initialState.project, action) {
	let newState
	switch (action.type) {
		case UPDATE_PROJECT:
			newState = { ...state }
			newState.project = action.value
			return newState
		default:
			return state
	}
}

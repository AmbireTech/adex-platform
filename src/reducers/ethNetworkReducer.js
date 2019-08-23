import { UPDATE_GAS_DATA } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function tagsReducer(state = initialState.tags, action) {
	let newState

	switch (action.type) {
		case UPDATE_GAS_DATA:
			newState = { ...state }
			newState.gasData = { ...action.gasData }
			return newState
		default:
			return state
	}
}

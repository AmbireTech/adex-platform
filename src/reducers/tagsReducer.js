import { UPDATE_TAGS, ADD_NEW_TAG } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function tagsReducer(state = initialState.tags, action) {
	let newState

	switch (action.type) {
	case UPDATE_TAGS:
		newState = {...state, ...action.tags}
		return newState
	case ADD_NEW_TAG:
		newState = {...state}
		newState[action.tag] = action.tag
		return newState
	default:
		return state
	}
}

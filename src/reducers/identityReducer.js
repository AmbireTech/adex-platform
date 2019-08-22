import { UPDATE_IDENTITY, RESET_IDENTITY } from '../constants/actionTypes'
import initialState from 'store/initialState'

export default function identityReducer(state = initialState.identity, action) {
	let newState
	let newidentity

	newState = { ...state }

	switch (action.type) {
		case UPDATE_IDENTITY:
			newidentity = newState
			if (Array.isArray(newidentity[action.prop])) {
				newidentity[action.prop] = [...action.value]
			} else {
				newidentity[action.prop] = action.value
			}

			newState = newidentity

			return newState

		case RESET_IDENTITY:
			newidentity = { ...initialState.identity }
			newState = newidentity
			return newState

		default:
			return state
	}
}

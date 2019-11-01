import { UPDATE_IDENTITY, RESET_IDENTITY } from '../constants/actionTypes'
import initialState from 'store/initialState'

export default function identityReducer(state = initialState.identity, action) {
	let newState
	let newIdentity

	newState = { ...state }

	switch (action.type) {
		case UPDATE_IDENTITY:
			newIdentity = newState
			if (Array.isArray(newIdentity[action.prop])) {
				newIdentity[action.prop] = [...action.value]
			} else {
				newIdentity[action.prop] = action.value
			}

			newState = newIdentity

			return newState

		case RESET_IDENTITY:
			newIdentity = { ...initialState.identity }
			newState = newIdentity
			return newState

		default:
			return state
	}
}

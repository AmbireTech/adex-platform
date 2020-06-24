import { UPDATE_TARGETING_ANALYTICS } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function targetingReducer(
	state = initialState.targeting,
	action
) {
	let newState

	switch (action.type) {
		case UPDATE_TARGETING_ANALYTICS:
			newState = { ...state }
			newState = action.value
			return newState
		default:
			return state
	}
}

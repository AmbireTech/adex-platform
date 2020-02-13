import { UPDATE_RESOLVE_ENS_ADDRESS } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function ensReducer(state = initialState.ensAddresses, action) {
	let newState
	switch (action.type) {
		case UPDATE_RESOLVE_ENS_ADDRESS:
			newState = { ...state }
			newState[action.item] = action.value
			return newState

		default:
			return state
	}
}

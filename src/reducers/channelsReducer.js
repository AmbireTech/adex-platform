import {
	UPDATE_CHANNELS_WITH_BALANCE,
	RESET_CHANNELS_WITH_BALANCE,
} from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function channelsReducer(state = initialState.channels, action) {
	let newState = { ...state }

	switch (action.type) {
		case UPDATE_CHANNELS_WITH_BALANCE:
			newState.withBalance = [...action.withBalance]
			return newState
		case RESET_CHANNELS_WITH_BALANCE:
			newState.withBalance = initialState.channels.withBalance
			return newState
		default:
			return state
	}
}

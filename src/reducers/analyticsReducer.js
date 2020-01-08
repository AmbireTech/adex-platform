import {
	UPDATE_ANALYTICS,
	RESET_ANALYTICS,
	UPDATE_ANALYTICS_TIMEFRAME,
} from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function analyticsReducer(
	state = initialState.analytics,
	action
) {
	let newState

	switch (action.type) {
		case UPDATE_ANALYTICS_TIMEFRAME:
			newState = { ...state }
			newState.tf = action.value
			return newState
		case UPDATE_ANALYTICS:
			newState = { ...state }
			newState[action.side] = { ...newState[action.side] }
			newState[action.side][action.eventType] = {
				...newState[action.side][action.eventType],
			}
			newState[action.side][action.eventType][action.metric] = {
				...newState[action.side][action.eventType][action.metric],
			}
			newState[action.side][action.eventType][action.metric][
				action.timeframe
			] = { ...action.value }
			return newState

		case RESET_ANALYTICS:
			newState = { ...initialState.analytics }
			return newState

		default:
			return state
	}
}

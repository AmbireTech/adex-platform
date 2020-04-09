import {
	UPDATE_ANALYTICS,
	RESET_ANALYTICS,
	UPDATE_ANALYTICS_TIMEFRAME,
	UPDATE_ANALYTICS_PERIOD,
	UPDATE_ANALYTICS_LAST_CHECKED,
	UPDATE_PUBLISHER_RECEIPTS,
	UPDATE_ADVANCED_ANALYTICS,
	UPDATE_DEMAND_ANALYTICS,
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
			newState.timeframe = action.value
			return newState
		case UPDATE_ANALYTICS_LAST_CHECKED:
			newState = { ...state }
			newState.lastChecked = action.value
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
			] = {
				...newState[action.side][action.eventType][action.metric][
					action.timeframe
				],
			}
			newState[action.side][action.eventType][action.metric][action.timeframe][
				action.timestamp
			] = { ...action.value }
			return newState
		case UPDATE_ADVANCED_ANALYTICS:
			newState = { ...state }
			newState.advanced = { ...newState.advanced }
			newState.advanced[action.eventType] = {
				...action.value,
			}
			return newState
		case UPDATE_DEMAND_ANALYTICS:
			newState = { ...state }
			newState.demand = action.value
			return newState
		case UPDATE_PUBLISHER_RECEIPTS:
			newState = { ...state }
			newState.receipts = { ...newState.receipts, ...action.value }
			return newState
		case RESET_ANALYTICS:
			newState = { ...initialState.analytics }
			return newState
		case UPDATE_ANALYTICS_PERIOD:
			newState = { ...state }
			newState.period = action.value
			return newState
		default:
			return state
	}
}

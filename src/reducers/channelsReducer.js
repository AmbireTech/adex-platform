import {
	UPDATE_CHANNELS_WITH_BALANCE_ALL,
	RESET_CHANNELS_WITH_BALANCE_ALL,
	UPDATE_CHANNELS_WITH_OUTSTANDING_BALANCE,
	RESET_CHANNELS_WITH_OUTSTANDING_BALANCE,
} from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function channelsReducer(state = initialState.channels, action) {
	let newState = { ...state }

	switch (action.type) {
		case UPDATE_CHANNELS_WITH_BALANCE_ALL:
			newState.withBalanceAll = { ...action.channels }
			return newState
		case RESET_CHANNELS_WITH_BALANCE_ALL:
			newState.withBalanceAll = initialState.channels.withBalanceAll
			return newState
		case UPDATE_CHANNELS_WITH_OUTSTANDING_BALANCE:
			newState.withOutstandingBalance = [...action.channels]
			return newState
		case RESET_CHANNELS_WITH_OUTSTANDING_BALANCE:
			newState.withOutstandingBalance =
				initialState.channels.withOutstandingBalance
			return newState

		default:
			return state
	}
}

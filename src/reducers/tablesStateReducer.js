import { UPDATE_TABLE_STATE, RESET_TABLE_STATE } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function tableStateReducer(
	state = initialState.tablesState,
	action
) {
	let newState
	switch (action.type) {
		case UPDATE_TABLE_STATE:
			newState = { ...state }
			newState[action.identity] = { ...(newState[action.identity] || {}) }
			newState[action.identity][action.tableId] = action.value || {}
			return newState

		case RESET_TABLE_STATE:
			return initialState.tablesState

		default:
			return state
	}
}

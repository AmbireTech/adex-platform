import {
	UPDATE_TABLE_STATE,
	RESET_ALL_TABLES_STATE,
	RESET_TABLE_STATE_BY_ID,
} from 'constants/actionTypes'
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

		case RESET_TABLE_STATE_BY_ID:
			newState = { ...state }
			newState[action.identity] = { ...(newState[action.identity] || {}) }
			newState[action.identity][action.tableId] = undefined
			return newState

		case RESET_ALL_TABLES_STATE:
			return initialState.tablesState

		default:
			return state
	}
}

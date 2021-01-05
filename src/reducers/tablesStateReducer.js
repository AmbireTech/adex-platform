import { UPDATE_TABLE_STATE } from 'constants/actionTypes'
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
			newState[action.identity][action.tableId] = {
				...(newState[action.identity][action.tableId] || {}),
			}
			return newState

		default:
			return state
	}
}

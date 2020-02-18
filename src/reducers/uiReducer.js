import { UPDATE_GLOBAL_UI, UPDATE_UI_BY_IDENTITY } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function uiReducer(state = initialState.ui, action) {
	let newState
	switch (action.type) {
		case UPDATE_UI_BY_IDENTITY:
			newState = { ...state }
			newState.byIdentity = { ...newState.byIdentity }
			newState.byIdentity[action.identity] = {
				...newState.byIdentity[action.identity],
			}
			if (action.category) {
				newState.byIdentity[action.identity][action.category] = {
					...newState.byIdentity[action.identity][action.category],
				}
				newState.byIdentity[action.identity][action.category][action.item] =
					action.value
			} else {
				newState.byIdentity[action.identity][action.item] = action.value
			}
			return newState
		case UPDATE_GLOBAL_UI:
			newState = { ...state }
			newState.global = { ...newState.global }
			if (action.category) {
				newState.global[action.category] = { ...newState[action.category] }
				newState.global[action.category][action.item] = action.value
			} else {
				newState.global[action.item] = action.value
			}
			return newState
		default:
			return state
	}
}

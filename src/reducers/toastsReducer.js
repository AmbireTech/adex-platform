import { ADD_TOAST, REMOVE_TOAST } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function toastsReducer(state = initialState.toasts, action) {
	let newState
	let newToast

	switch (action.type) {
		case ADD_TOAST:
			newToast = { ...action.toast }
			newToast.added = Date.now()
			newState = [newToast, ...state]
			return newState

		case REMOVE_TOAST:
			newState = state.filter(t => t.id !== action.toast)
			return newState
		default:
			return state
	}
}

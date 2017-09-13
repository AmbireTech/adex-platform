import { ADD_TOAST, REMOVE_TOAST } from '../constants/actionTypes'
import initialState from './../store/initialState'
import Helper from './../helpers/miscHelpers'

export default function uiReducer(state = initialState.toasts, action) {
    let newState
    let newToast

    switch (action.type) {
        case ADD_TOAST:
            newToast = { ...action.toast }
            newToast.id = Helper.getGuid()
            newToast.added = Date.now()
            newState = [newToast, ...state,]

            return newState

        case REMOVE_TOAST:
            newState = state.filter((t) => t.id !== action.toast)

            return newState

        default:
            return state

    }
}

import { ADD_TOAST, REMOVE_TOAST, UPDATE_ITEM } from '../constants/actionTypes'
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
        // TODO: Consider this as place for setting notifications and use common function
        // This way we lose the chance for custom callback on click on the toaster (undo some delete for example) (DO we need such thing?)
        case UPDATE_ITEM:
            newToast = { label: action.item.name + ' updated!', type: 'accept', action: 'OK', timeout: 5000 }
            newToast.id = Helper.getGuid()
            newToast.added = Date.now()
            // Force to re render the same toast instead to satay at the que
            if (state[0] && (newToast.label === state[0].label)) {
                newState = [newToast, ...(state.slice(0, 0))]
            } else {
                newState = [newToast, ...state]
            }

            return newState

        default:
            return state

    }
}

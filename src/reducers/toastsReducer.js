import { ADD_TOAST, REMOVE_TOAST} from 'constants/actionTypes'
import initialState from 'store/initialState'
import Helper from 'helpers/miscHelpers'
import { items as ItemsConstants } from 'adex-constants'

export default function toastsReducer(state = initialState.toasts, action) {
    let newState
    let newToast

    const toasts = (state = [], action) => {
        let newToast = action
        newToast.id = Helper.getGuid()
        newToast.added = Date.now()
        // Force to re render the same toast instead to satay at the queue
        if (state[0] && (newToast.label === state[0].label)) {
            return [newToast, ...(state.slice(0, 0))]
        } else {
            return [newToast, ...state]
        }
    }

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

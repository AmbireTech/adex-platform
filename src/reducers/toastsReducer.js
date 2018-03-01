import { ADD_TOAST, REMOVE_TOAST, UPDATE_ITEM, ADD_ITEM, DELETE_ITEM, ADD_ITEM_TO_ITEM, REMOVE_ITEM_FROM_ITEM } from 'constants/actionTypes'
import initialState from 'store/initialState'
import Helper from 'helpers/miscHelpers'
import { items as ItemsConstants } from 'adex-constants'

const { ItemTypesNames } = ItemsConstants

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

        case UPDATE_ITEM:
            return toasts(state, { label: ItemTypesNames[action.item._type] + ' ' + action.item._meta.fullName + ' has been updated!', type: 'accept', action: 'X', timeout: 5000 })
        case ADD_ITEM:
            return toasts(state, { label: ItemTypesNames[action.item._type] + ' ' + action.item._meta.fullName + ' has been added!', type: 'accept', action: 'X', timeout: 5000 })
        case DELETE_ITEM:
            return toasts(state, { label: ItemTypesNames[action.item._type] + ' ' + action.item._meta.fullName + ' has been DELETED!', type: 'warning', action: 'X', timeout: 5000 })
        case ADD_ITEM_TO_ITEM:
            return toasts(state, { label: ItemTypesNames[action.toAdd._type] + ' ' + action.toAdd._meta.fullName + ' has been ADDED to ' + ItemTypesNames[action.item._type] + ' ' + action.item._meta.fullName, type: 'accept', action: 'X', timeout: 5000 })
        case REMOVE_ITEM_FROM_ITEM:
            return toasts(state, { label: ItemTypesNames[action.toRemove._type] + ' ' + action.toRemove._meta.fullName + ' has been REMOVED from ' + ItemTypesNames[action.item._type] + ' ' + action.item._meta.fullName, type: 'warning', action: 'X', timeout: 5000 })
        default:
            return state
    }
}

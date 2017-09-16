import * as types from '../constants/actionTypes'

export function updateNewItem(item, newMeta) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_NEW_ITEM,
            item: item,
            meta: newMeta
        })
    }
}

export function resetNewItem(item) {
    return function (dispatch) {
        return dispatch({
            type: types.RESET_NEW_ITEM,
            item: item
        })
    }
}

export function addItem(item) {
    return function (dispatch) {
        return dispatch({
            type: types.ADD_ITEM,
            item: item
        })
    }
}

export function deleteItem(item) {
    return function (dispatch) {
        return dispatch({
            type: types.DELETE_ITEM,
            item: item
        })
    }
}

export function removeItemFromItem({ item, toRemove } = {}) {
    return function (dispatch) {
        return dispatch({
            type: types.REMOVE_ITEM_FROM_ITEM,
            item: item,
            toRemove: toRemove,
        })
    }
}

export function addItemFromItem({ item, toAdd } = {}) {
    return function (dispatch) {
        return dispatch({
            type: types.ADD_ITEM_TO_ITEM,
            item: item,
            toAdd: toAdd,
        })
    }
}

export function updateItem(item, newMeta) {
    return function (dispatch) {
        setTimeout(() => {
            dispatch({
                type: types.UPDATE_ITEM,
                item: item,
                meta: newMeta
            })

        }, 1000)
    }
}

export function setCurrentItem(item) {
    return function (dispatch) {
        return dispatch({
            type: types.SET_CURRENT_ITEM,
            item: item
        })
    }
}

export function updateCurrentItem(item, newMeta) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_CURRENT_ITEM,
            item: item,
            meta: newMeta
        })
    }
}

export function updateSpinner(item, value) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_SPINNER,
            spinner: item,
            value: value
        })
    }
}

export function updateUi(item, value) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_UI,
            item: item,
            value: value
        })
    }
}

export function addToast({ type, action, label = '', timeout = false }) {
    return function (dispatch) {
        return dispatch({
            type: types.ADD_TOAST,
            toast: { type: type, action: action, label, timeout: timeout }
        })
    }
}

export function removeToast(toastId) {
    return function (dispatch) {
        return dispatch({
            type: types.REMOVE_TOAST,
            toast: toastId
        })
    }
}

export function confirmAction(onConfirm, onCancel,
    { confirmLabel = '', cancelLabel = '', title = '', text = '' } = {}) {
    return function (dispatch) {
        return dispatch({
            type: types.CONFIRM_ACTION,
            confirm: {
                onConfirm: onConfirm,
                onCancel: onCancel,
                data: {
                    confirmLabel: confirmLabel,
                    cancelLabel: cancelLabel,
                    title: title,
                    text: text
                }
            }
        })
    }
}

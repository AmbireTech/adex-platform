import * as types from 'constants/actionTypes'

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

export function addItem(item, itemToAddTo) {

    /**  
     *  Add item to bc and data ipsf here
        kind like that:

        web3services.addItem(item)
            .then(
                response => {
                    dispatch({
                        type: types.ADD_ITEM,
                        item: response
                    })

                    return dispatch({
                        type: types.ADD_ITEM_TO_ITEM,
                        item: itemToAddTo,
                        toAdd: response._id,
                    })
                }
            )

            etc...
    */

    return function (dispatch) {
        dispatch({
            type: types.ADD_ITEM,
            item: item
        })

        if (itemToAddTo) {
            item = { ...item }
            item._id = item.tempId
            return dispatch({
                type: types.ADD_ITEM_TO_ITEM,
                item: itemToAddTo,
                toAdd: item, // TODO!!!
            })
        } else {
            return
        }
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

export function addItemToItem({ item, toAdd } = {}) {
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

        }, 3000)
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

export function updateNav(item, value) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_NAV,
            item: item,
            value: value
        })
    }
}

export function changeLanguage(lang) {
    return function (dispatch) {
        return dispatch({
            type: types.CHANGE_LANGUAGE,
            lang: lang
        })
    }
}

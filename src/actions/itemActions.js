import * as types from '../constants/actionTypes'

export function addItem(item) {
    return function (dispatch) {
        return dispatch({
            type: types.ADD_ITEM,
            item: item
        })        
    }
}

export function updateNewItem(item) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_NEW_ITEM,
            item: item
        })        
    }
}

export function resetNewItem() {
    return function (dispatch) {
        return dispatch({
            type: types.RESET_NEW_ITEM
        })        
    }
}

export function deleteItem(item) {
    return function (dispatch) {
        return dispatch({
        // return {
            type: types.DELETE_ITEM,
            item: item
        // }
        })        
    }
}

export function removeItemFromItem({item, toRemove} = {}) {
    return function (dispatch) {
        return dispatch({
        // return {
            type: types.REMOVE_ITEM_FROM_ITEM,
            item: item,
            toRemove: toRemove,
        // }
        })        
    }
}

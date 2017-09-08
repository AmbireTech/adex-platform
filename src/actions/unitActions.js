import * as types from '../constants/actionTypes'

export function addUnit(unit) {
    return function (dispatch) {
        return dispatch({
            type: types.ADD_UNIT,
            unit: unit
        })        
    }
}

export function updateNewUnit(unit) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_NEW_UNIT,
            unit: unit
        })        
    }
}

export function resetNewUnit() {
    return function (dispatch) {
        return dispatch({
            type: types.RESET_NEW_UNIT
        })        
    }
}

export function deleteUnit(unit) {
    return function (dispatch) {
        return dispatch({
        // return {
            type: types.DELETE_UNIT,
            id: unit
        // }
        })        
    }
}

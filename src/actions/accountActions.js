import * as types from 'constants/actionTypes'

export function updateSignin(prop, value) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_SIGNIN,
            prop: prop,
            value: value
        })
    }
}

export function resetSignin() {
    return function (dispatch) {
        return dispatch({
            type: types.RESET_SIGNIN
        })
    }
}

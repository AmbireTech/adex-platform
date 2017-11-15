import { UPDATE_SIGNIN, RESET_SIGNIN } from '../constants/actionTypes'
import initialState from 'store/initialState'

export default function accountReducer(state = initialState.account, action) {

    let newState
    let newCollection
    let newSignin

    const collection = (state = [], action) => {
        if (!action.item) return state
        return [
            ...state.slice(0, action.item._id),
            action.item,
            ...state.slice(action.item._id + 1)
        ]
    }

    newState = { ...state }

    switch (action.type) {
        case UPDATE_SIGNIN:
            newSignin = { ...newState.signin }
            if (Array.isArray(newSignin[action.prop])) {
                newSignin[action.prop] = [...action.value]
            } else {
                newSignin[action.prop] = action.value
            }

            newState.signin = newSignin

            return newState

        case RESET_SIGNIN:
            newSignin = { ...initialState.account.signin }
            newState.signin = newSignin
            return newState

        default:
            return state
    }
}

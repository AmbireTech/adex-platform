import { UPDATE_NAV } from '../constants/actionTypes'
import initialState from './../store/initialState'

export default function navReducer(state = initialState.nav, action) {
    let newState

    switch (action.type) {
        case UPDATE_NAV:
            newState = { ...state }
            newState[action.item] = action.value
            return newState

        default:
            return state

    }
}

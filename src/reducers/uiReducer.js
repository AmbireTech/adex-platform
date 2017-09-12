import { UPDATE_UI } from '../constants/actionTypes'
import initialState from './../store/initialState'

export default function uiReducer(state = initialState.ui, action) {
    let newState
    
    switch (action.type) {
        case UPDATE_UI:
            newState = { ...state }
            newState[action.item] = action.value
            break

        default:
            newState = state
            break
    }

    return newState
}

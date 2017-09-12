import { UPDATE_SPINNER } from '../constants/actionTypes'
import initialState from './../store/tempInitialState'

export default function itemsReducer(state = initialState.spinners, action) {
    let newState
    
    switch (action.type) {
        case UPDATE_SPINNER:
            newState = { ...state }
            newState[action.spinner] = action.value
            break

        default:
            newState = state
            break
    }

    return newState
}

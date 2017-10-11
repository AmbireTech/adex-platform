import { UPDATE_SPINNER } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function spinnersReducer(state = initialState.spinners, action) {
    let newState
    
    switch (action.type) {
        case UPDATE_SPINNER:
            newState = { ...state }
            newState[action.spinner] = action.value
            
            return newState

        default:
            return state
    }
}

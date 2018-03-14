import { UPDATE_SPINNER, UPDATE_ITEM } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function spinnersReducer(state = initialState.spinners, action) {
    let newState = { ...state }

    switch (action.type) {
        case UPDATE_SPINNER:
            newState[action.spinner] = action.value

            return newState
        case UPDATE_ITEM:
            newState['update' + action.item._id] = false
            return newState

        default:
            return state
    }
}

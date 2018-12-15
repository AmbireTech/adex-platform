import { UPDATE_UI } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function uiReducer(state = initialState.ui, action) {
    let newState
    switch (action.type) {
        case UPDATE_UI:
            newState = { ...state }
            if (action.category) {
                newState[action.category] = { ...newState[action.category]}
                newState[action.category][action.item] = action.value
            } else {
                newState[action.item] = action.value
            }
            return newState

        default:
            return state
    }
}

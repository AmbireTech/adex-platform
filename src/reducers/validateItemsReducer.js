import { UPDATE_ITEM_VALIDATION, RESET_ITEM_VALIDATION } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function validateItemsReducer(state = initialState.validations, action) {

    let newState
    let newErrors

    switch (action.type) {
        case UPDATE_ITEM_VALIDATION:
            newState = { ...state }
            newErrors = { ...newState[action.item], ...action.errors }
            newState[action.item] = newErrors

            return newState

        case RESET_ITEM_VALIDATION:
            newState = { ...state }
            newErrors = { ...newState[action.item] }
            if (newErrors && newErrors.hasOwnProperty(action.key)) {
                // TODO: Keep it like that or change canAdvance function
                delete newErrors[action.key]
            } else if (newErrors && !action.key) {
                newErrors = {}
            }

            newState[action.item] = newErrors

            return newState

        default:
            return state
    }
}

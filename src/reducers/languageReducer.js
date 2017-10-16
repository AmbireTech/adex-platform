import initialState from 'store/initialState'
import { CHANGE_LANGUAGE } from 'constants/actionTypes'

export default function languageReducer(state = initialState.language, action) {
    switch (action.type) {
        case CHANGE_LANGUAGE:
            return action.lang || state
        default:
            return state
    }
}

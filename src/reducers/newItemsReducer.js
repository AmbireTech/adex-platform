import { UPDATE_NEW_ITEM, RESET_NEW_ITEM } from '../constants/actionTypes';
import initialState from './../store/tempInitialState';

export default function newItemsReducer(state = initialState.newItem, action) {

    let newState
    let newItem
    let newMeta

    const meta = (state = {}, action) => {
        // TODO: Validate if used with array value
        for (var key in action) {
            if (action.hasOwnProperty(key) && state.hasOwnProperty(key)) {
                state[key] = action[key] || state[key]
            }
        }

        return state
    }

    switch (action.type) {
        case UPDATE_NEW_ITEM:
            newState = { ...state }
            newItem = { ...newState[action.item._type] }
            newMeta = { ...newItem._meta }
            newItem._meta = meta(newMeta, action.meta)
            newState[action.item._type] = newItem

            return newState

        case RESET_NEW_ITEM:
            newState = { ...state }
            newItem = initialState.newItem[action.item._type]
            newState[action.item._type] = newItem

            return newState

        default:
            return state
    }
}

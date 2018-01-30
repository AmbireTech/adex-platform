import { UPDATE_NEW_ITEM, RESET_NEW_ITEM } from 'constants/actionTypes'
import initialState from 'store/initialState'
import { Base } from 'adex-models'
import { ItemModelsByType } from 'constants/itemsTypes'

export default function newItemsReducer(state = initialState.newItem, action) {

    let newState
    let newItem

    switch (action.type) {
        case UPDATE_NEW_ITEM:
            newState = { ...state }
            newItem = { ...action.item }
            newState[newItem._type] = newItem

            return newState

        case RESET_NEW_ITEM:
            newState = { ...state }
            newItem = { ...initialState.newItem[action.item._type] }
            newState[action.item._type] = newItem

            return newState

        default:
            return state
    }
}

import { UPDATE_NEW_ITEM, RESET_NEW_ITEM } from 'constants/actionTypes'
import initialState from 'store/initialState'
import Base from 'models/Base'
import { ItemModelsByType } from 'constants/itemsTypes'

export default function newItemsReducer(state = initialState.newItem, action) {

    let newState
    let newItem

    switch (action.type) {
        case UPDATE_NEW_ITEM:
            newState = { ...state }
            newItem = { ...action.item }
            newItem._name = '' // temp bugfix
            newItem = Base.updateObject({ item: newItem, meta: { ...action.meta }, objModel: ItemModelsByType[newItem._meta.type] })
            newState[action.item._type] = newItem

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

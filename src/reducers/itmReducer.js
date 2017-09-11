import { ADD_ITEM, DELETE_ITEM, REMOVE_ITEM_FROM_ITEM } from '../constants/actionTypes'
import initialState from './../store/tempInitialState'
import { ItemsTypes } from './../constants/itemsTypes'

export default function itemsReducer(state = initialState.items, action) {
    let newState
    let newCollection
    let newMeta
    let newItem
    let collectionId
    let item

    const collection = (state = [], action) => {
        if (!action.item) return state
        return [
            ...state.slice(0, action.item.id),
            action.item,
            ...state.slice(action.item.id + 1)
        ]
    }

    switch (action.type) {
        case ADD_ITEM:
            newState = { ...state }
            item = action.item
            collectionId = item._type
            let id = newState[collectionId].length
            let owner = item._owner
            newItem = new item.item_type(owner, id, item._name, item._meta)
            action.id = id
            newCollection = collection(newState[collectionId], { ...action, item: newItem })

            newState[collectionId] = newCollection

            return newState

        case DELETE_ITEM:
            newState = { ...state }
            item = action.item
            collectionId = item._type
            newItem = newState[collectionId][item.id].getClone()  //TODO: check for possible memory leak
            newMeta = { ...newItem._meta }
            newMeta.deleted = true
            newItem._meta = newMeta
            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection
            return newState

        case REMOVE_ITEM_FROM_ITEM:
            newState = { ...state }
            item = action.item
            collectionId = item._type
            newItem = newState[collectionId][item.id].getClone()
            let toRemoveId = action.toRemove.id || action.toRemove
            newItem.removeItem(toRemoveId)
            action.id = item.id

            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection

            return newState

        default:
            return state
    }
}

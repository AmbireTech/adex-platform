import { ADD_ITEM, DELETE_ITEM, UPDATE_ITEM, REMOVE_ITEM_FROM_ITEM, ADD_ITEM_TO_ITEM, UPDATE_CURRENT_ITEM } from '../constants/actionTypes'
import initialState from './../store/tempInitialState'

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

    const meta = (state = {}, action) => {
        // TODO: Validate if used with array value
        for (var key in action) {
            if (action.hasOwnProperty(key) && state.hasOwnProperty(key)) {
                state[key] = action[key] || state[key]
            }
        }

        return state
    }

    if (action.item) {
        newState = { ...state }
        item = action.item
        collectionId = item._type
    }

    switch (action.type) {
        case ADD_ITEM:
            let id = newState[collectionId].length
            let owner = item._owner
            newItem = new item.item_type(owner, id, item._name || item._meta.fullName, item._meta)
            action.id = id
            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection
            return newState

        case DELETE_ITEM:
            newItem = newState[collectionId][item.id].getClone()  //TODO: check for possible memory leak
            newMeta = { ...newItem._meta }
            newMeta.deleted = true
            newItem._meta = newMeta
            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection
            return newState

        case REMOVE_ITEM_FROM_ITEM:
            newItem = newState[collectionId][item.id].getClone()
            let toRemoveId = action.toRemove.id || action.toRemove
            newItem.removeItem(toRemoveId)
            action.id = item.id
            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection
            return newState

        // TODO: Use UPDATE_ITEM only when saved, otherwise use new state objects for not saved changes!!!
        case UPDATE_ITEM:
            newItem = newState[collectionId][item.id].getClone()  //TODO: check for possible memory leak
            newMeta = { ...item._meta }
            newItem._meta = meta(newMeta, action.meta)
            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection
            return newState

        default:
            return state
    }
}

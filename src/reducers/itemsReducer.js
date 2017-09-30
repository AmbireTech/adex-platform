import { ADD_ITEM, DELETE_ITEM, UPDATE_ITEM, REMOVE_ITEM_FROM_ITEM, ADD_ITEM_TO_ITEM } from '../constants/actionTypes' // eslint-disable-line no-unused-vars
import initialState from './../store/initialState'
import Base from './../models/Base'
import Item from './../models/Item'

export default function itemsReducer(state = initialState.items, action) {

    let newState
    let newCollection
    let newItem
    let collectionId
    let item

    const collection = (state = [], action) => {
        if (!action.item) return state
        return [
            ...state.slice(0, action.item._id),
            action.item,
            ...state.slice(action.item._id + 1)
        ]
    }

    if (action.item) {
        newState = { ...state }
        item = action.item
        collectionId = item._type
    }

    switch (action.type) {
        case ADD_ITEM:
            // TODO: the item should come here ready (with id from bc and ipsf)
            // id is going to be set when it comes here
            let id = action.item.tempId //newState[collectionId].length
            let owner = item._owner
            newItem = new item.item_type(owner, id, item._name || item._meta.fullName, item._meta).plainObj()
            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection
            return newState

        case ADD_ITEM_TO_ITEM:
            newItem = Item.addItem(newState[collectionId][item._id], action.toAdd._id)
            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection
            return newState

        case DELETE_ITEM:
            newItem = Base.updateMeta(newState[collectionId][item._id], { deleted: true, modifiedOn: Date.now() })
            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection
            return newState

        case REMOVE_ITEM_FROM_ITEM:
            newItem = Item.removeItem(newState[collectionId][item._id], action.toRemove._id)
            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection
            return newState

        case UPDATE_ITEM:
            newItem = Base.updateMeta(newState[collectionId][item._id], { ...action.meta, modifiedOn: Date.now() })
            newCollection = collection(newState[collectionId], { ...action, item: newItem })
            newState[collectionId] = newCollection
            return newState

        default:
            return state
    }
}

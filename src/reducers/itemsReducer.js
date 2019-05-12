import { ADD_ITEM, DELETE_ITEM, UPDATE_ITEM, REMOVE_ITEM_FROM_ITEM, ADD_ITEM_TO_ITEM, UPDATE_ALL_ITEMS, RESET_ALL_ITEMS } from 'constants/actionTypes' // eslint-disable-line no-unused-vars
import initialState from 'store/initialState'
import { Item } from 'adex-models'

export default function itemsReducer(state = initialState.items, action) {

	let newState
	let newCollection
	let newItem
	let collectionId
	let item

	const collection = (state = {}, action) => {
		if (!action.item) return state
		return {
			...state,
			[action.item.id]: action.item,
		}
	}

	const removeCollectionProp = (collection = {}, prop) => {
		let newCol = { ...collection }
		delete newCol[prop]
		return newCol
	}

	if (action.item && action.itemType) {
		newState = { ...state }
		item = { ...action.item }
		collectionId = action.itemType
	}

	switch (action.type) {
	case ADD_ITEM:
		// TODO: the item should come here ready (with id from bc and ipsf)
		// id is going to be set when it comes here
		newItem = item
		newCollection = collection(newState[collectionId], { ...action, item: newItem })
		newState[collectionId] = newCollection
		return newState

	case ADD_ITEM_TO_ITEM:
		newItem = Item.addItem(newState[collectionId][item._id], action.toAdd)
		newCollection = collection(newState[collectionId], { ...action, item: newItem })
		newState[collectionId] = newCollection
		return newState

	case DELETE_ITEM:
		newCollection = removeCollectionProp(newState[collectionId], item._id)
		newState[collectionId] = newCollection
		return newState

	case REMOVE_ITEM_FROM_ITEM:
		newItem = Item.removeItem(newState[collectionId][item._id], action.toRemove)
		newCollection = collection(newState[collectionId], { ...action, item: newItem })
		newState[collectionId] = newCollection
		return newState

	case UPDATE_ITEM:
		newItem = item
		newCollection = collection(newState[collectionId], { ...action, item: newItem })
		newState[collectionId] = newCollection
		return newState

	case UPDATE_ALL_ITEMS:
		newState = { ...state }
		const newItems = action.items.reduce((items, item, index) => {
			const currentItems = {...items}
			const newItem = { ...item }
			currentItems[newItem.id || newItem.ipfs] = newItem
			return currentItems
		}, newState[action.itemType])

		newState[action.itemType] = newItems
		return newState
	case RESET_ALL_ITEMS:
		newState = { ...initialState.items }
		return newState

	default:
		return state
	}
}

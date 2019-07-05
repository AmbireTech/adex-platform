import { SET_CURRENT_ITEM, UPDATE_CURRENT_ITEM } from './../constants/actionTypes'
import initialState from './../store/initialState'
import { Base } from 'adex-models'


export default function currentItemReducer(state = initialState.currentItem, action) {
	let newState

	if (!action.item) return state

	switch (action.type) {
	case SET_CURRENT_ITEM:
		newState = { ...action.item } || {}
		newState.dirty = false
		newState.dirtyProps = []

		return newState

	case UPDATE_CURRENT_ITEM:
		newState = Base.updateMeta(state || action.item, action.meta, state.dirtyProps)
		newState._meta.dirty = true
		return newState

	default:
		return state
	}
}

import { SET_CURRENT_ITEM, UPDATE_CURRENT_ITEM } from '../constants/actionTypes'
import initialState from './../store/tempInitialState'

export default function newItemsReducer(state = initialState.currentItem, action) {
    let newState
    let newMeta

    const meta = (state = {}, action, dirtyProps = []) => {
        dirtyProps = [...dirtyProps]
        // TODO: Validate if used with array value
        for (var key in action) {
            if (action.hasOwnProperty(key) && state.hasOwnProperty(key)) {
                state[key] = action[key] || state[key]

                if (dirtyProps.indexOf(key) < 0) dirtyProps.push(key)
            }
        }

        return {
            state: state,
            dirtyProps: dirtyProps
        }
    }

    if (!action.item) return state

    switch (action.type) {
        case SET_CURRENT_ITEM:
            newState = action.item.getClone() || {}
            newState.dirty = false
            newState.dirtyProps = []

            return newState

        case UPDATE_CURRENT_ITEM:
            newState = state.getClone() || action.item.getClone()
            newMeta = { ...state._meta }
            newState.dirty = true
            let mt = meta(newMeta, action.meta, newState.dirtyProps)
            newState._meta = mt.state
            newState.dirtyProps = mt.dirtyProps
            return newState

        default:
            return state
    }
}

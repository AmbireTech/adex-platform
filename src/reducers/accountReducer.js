import { CREATE_ACCOUNT, RESET_ACCOUNT } from '../constants/actionTypes'
import initialState from 'store/initialState'

export default function accountReducer(state = initialState.account, action) {

    let newState
    let newCollection
    let newAccount

    const collection = (state = [], action) => {
        if (!action.item) return state
        return [
            ...state.slice(0, action.item._id),
            action.item,
            ...state.slice(action.item._id + 1)
        ]
    }

    newState = { ...state }

    switch (action.type) {
        case CREATE_ACCOUNT:
            newAccount = { ...action.account }
            newState = newAccount
            return newState
        case RESET_ACCOUNT:
            newAccount = initialState.account
            newState = newAccount
            return newState

        default:
            return state
    }
}

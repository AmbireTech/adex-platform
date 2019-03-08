import { UPDATE_WALLET, RESET_WALLET } from '../constants/actionTypes'
import initialState from 'store/initialState'

export default function identityReducer(state = initialState.wallet, action) {

    let newState
    let newWallet

    newState = { ...state }

    switch (action.type) {
        case UPDATE_WALLET:
            newWallet = newState
            if (Array.isArray(newWallet[action.prop])) {
                newWallet[action.prop] = [...action.value]
            } else {
                newWallet[action.prop] = action.value
            }

            newState = newWallet

            return newState

        case RESET_IDENTITY:
            newWallet = { ...initialState.wallet }
            newState = newidentity
            return newState

        default:
            return state
    }
}
import { CREATE_ACCOUNT, RESET_ACCOUNT, UPDATE_ACCOUNT } from '../constants/actionTypes'
import initialState from 'store/initialState'
import Base from 'models/Base'
import Account from 'models/Account'

export default function accountReducer(state = initialState.account, action) {

    let newState
    let newAccount

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
        case UPDATE_ACCOUNT:
            newAccount = Base.updateObject({ item: newState, meta: { ...action.meta }, ownProps: { ...action.ownProps }, objModel: Account })
            newState = newAccount
            return newState

        default:
            return state
    }
}

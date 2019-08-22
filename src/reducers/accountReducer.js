import {
	CREATE_ACCOUNT,
	RESET_ACCOUNT,
	UPDATE_ACCOUNT,
} from '../constants/actionTypes'
import initialState from 'store/initialState'
import { Base, Account } from 'adex-models'

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
			newAccount = Base.updateObject({
				item: newState,
				newValues: { ...action.newValues },
				objModel: Account,
			})
			newState = newAccount
			return newState

		default:
			return state
	}
}

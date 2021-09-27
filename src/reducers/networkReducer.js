import initialState from 'store/initialState'
import { CHANGE_NETWORK } from 'constants/actionTypes'

export default function networkReducer(state = initialState.network, action) {
	switch (action.type) {
		case CHANGE_NETWORK:
			const newNetwork = { ...(action.network || state) }
			return newNetwork
		default:
			return state
	}
}

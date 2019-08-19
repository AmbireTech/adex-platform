import { UPDATE_NEW_BID, RESET_NEW_BID } from 'constants/actionTypes'
import initialState from 'store/initialState'
import { Bid } from 'adex-models'

export default function newBidsReducer(state = initialState.newBid, action) {
	let newState
	let newBid

	newState = { ...state }

	switch (action.type) {
		case UPDATE_NEW_BID:
			newBid = { ...(newState[action.bidId] || initialState.newBid.empty) }
			newBid = Bid.updateBid(newBid, action.key, action.value)
			newState[action.bidId] = newBid
			return newState
		case RESET_NEW_BID:
			newBid = { ...initialState.newBid.empty }
			newState[action.bidId] = newBid
			return newState
		default:
			return state
	}
}

import {
	UNIT_PLACE_BID,
	UPDATE_ALL_BIDS,
	RESET_ALL_BIDS,
} from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function bidsReducer(state = initialState.bids, action) {
	let newBid

	let newState = { ...state }
	let newBidsById = { ...newState.bidsById }
	let newBidsIds = [...newState.bidsIds]
	let newBidsByAdslot = { ...newState.bidsByAdslot }
	let newBidsByAdunit = { ...newState.bidsByAdunit }

	switch (action.type) {
		case UNIT_PLACE_BID:
			newBid = { ...action.bid }
			newBidsById[newBid._id] = newBid
			// TODO: check if this bids exist before push
			newBidsIds = [...newBidsIds, newBid._id]
			newBidsByAdslot[newBid._adSlotId] = [
				...(newBidsByAdslot[newBid._adSlotId] || []),
				newBid._id,
			]
			newBidsByAdunit[newBid._adUnitId] = [
				...(newBidsByAdunit[newBid._adUnitId] || []),
				newBid._id,
			]

			newState.bidsById = newBidsById
			newState.bidsIds = newBidsIds
			newState.bidsByAdslot = newBidsByAdslot
			newState.bidsByAdunit = newBidsByAdunit

			return newState

		case UPDATE_ALL_BIDS:
			if (action.advBids) {
				newState.advBids = { ...action.advBids }
			}

			if (action.pubBids) {
				newState.pubBids = { ...action.pubBids }
			}

			if (action.bidsById) {
				newState.bidsById = { ...action.bidsById }
			}

			return newState
		case RESET_ALL_BIDS:
			return initialState.bids
		default:
			return state
	}
}

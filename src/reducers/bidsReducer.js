import { UNIT_PLACE_BID } from 'constants/actionTypes'
import initialState from 'store/initialState'

export default function bidsReducer(state = initialState.bids, action) {
    let newState
    let newBidsById
    let newBidsIds
    let newBidsByAdslot
    let newBidsByAdunit
    let newBid

    newState = { ...state }
    newBidsById = { ...newState.bidsById }
    newBidsIds = [...newState.bidsIds]
    newBidsByAdslot = { ...newState.bidsByAdslot }
    newBidsByAdunit = { ...newState.bidsByAdunit }

    switch (action.type) {
        case UNIT_PLACE_BID:
            newBid = { ...action.bid }
            newBidsById[newBid._id] = newBid
            // TODO: check if this bids exist before push
            newBidsIds = [...newBidsIds, newBid._id]
            newBidsByAdslot[newBid._adSlotId] = [...(newBidsByAdslot[newBid._adSlotId] || []), newBid._id]
            newBidsByAdunit[newBid._adUnitId] = [...(newBidsByAdunit[newBid._adUnitId] || []), newBid._id]

            newState.bidsById = newBidsById
            newState.bidsIds = newBidsIds
            newState.bidsByAdslot = newBidsByAdslot
            newState.bidsByAdunit = newBidsByAdunit

            return newState

        default:
            return state
    }
}

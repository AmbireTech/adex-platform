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
            newBidsById[newBid.id] = newBid
            // TODO: check if this bids exist before push
            newBidsIds = [...newBidsIds, newBid.id]
            newBidsByAdslot[newBid.adSlot] = [...(newBidsByAdslot[newBid.adSlot] || []), newBid.id]
            newBidsByAdunit[newBid.adUnit] = [...(newBidsByAdunit[newBid.adUnit] || []), newBid.id]

            newState.bidsById = newBidsById
            newState.bidsIds = newBidsIds
            newState.bidsByAdslot = newBidsByAdslot
            newState.bidsByAdunit = newBidsByAdunit

            return newState

        default:
            return state
    }
}

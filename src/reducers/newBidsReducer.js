import { UPDATE_NEW_BID } from 'constants/actionTypes'
import initialState from 'store/initialState'
import Bid from 'models/Bid'

export default function newBidsReducer(state = initialState.newBid, action) {
    let newState
    let newBid

    switch (action.type) {
        case UPDATE_NEW_BID:
            newState = { ...state }

            newBid = { ...(newState[action.bidId] || initialState.newBid.empty) }
            newBid = Bid.updateBid(newBid, action.key, action.value)
            newState[action.bidId] = newBid
            return newState

        default:
            return state
    }
}

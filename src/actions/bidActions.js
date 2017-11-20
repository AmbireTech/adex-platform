import * as types from 'constants/actionTypes'

// MEMORY STORAGE
export function updateNewBid({ bidId, key, value }) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_NEW_BID,
            bidId: bidId,
            key: key,
            value: value
        })
    }
}

// TODO: Add reset new bid

// PERSISTENT STORAGE
export function placeBid(bid, slot) {
    return function (dispatch) {
        return dispatch({
            type: types.UNIT_PLACE_BID,
            bid: bid,
            slot: slot
        })
    }
}
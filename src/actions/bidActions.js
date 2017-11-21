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

export function resetNewBid({ bidId }) {
    return function (dispatch) {
        return dispatch({
            type: types.RESET_NEW_BID,
            bidId: bidId
        })
    }
}

// PERSISTENT STORAGE
export function placeBid({bid, slot, unit}) {
    return function (dispatch) {
        // NOTE: Add here to web3, get the id etc...
        return dispatch({
            type: types.UNIT_PLACE_BID,
            bid: bid,
            slot: slot,
            unit: unit
        })
    }
}
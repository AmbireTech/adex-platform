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

// PERSIST STORAGE

export const updateBids = ({ advBids, pubBids, bidsById }) => {
    return (dispatch) => {
        return dispatch({
            type: types.UPDATE_ALL_BIDS,
            advBids: advBids,
            pubBids: pubBids,
            bidsById: bidsById
        })
    }
}
export const resetAllBids = () => {
    return (dispatch) => {
        return dispatch({
            type: types.RESET_ALL_BIDS,
        })
    }
}
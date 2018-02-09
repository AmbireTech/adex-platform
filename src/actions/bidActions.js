import * as types from 'constants/actionTypes'
import { placeBid as plsBid } from 'services/adex-node/actions'
import { Bid } from 'adex-models'
import scActions from 'services/smart-contracts/actions'
const { signBid } = scActions

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
export function placeBid({ bid, slot, unit, userAddr, authSig }) {
    bid = { ...bid }
    let bidInst = new Bid(bid)
    bidInst.adUnit = unit._ipfs
    bidInst.adUnitId = unit._id
    bidInst.advertiser = userAddr

    let typed = bidInst.typed

    return function (dispatch) {
        signBid({ typed: typed, userAddr: userAddr, authSig: authSig })
            .then((sig) => {
                bidInst.signature = sig

                return plsBid({ bid: bidInst.plainObj(), userAddr: userAddr, authSig: authSig })
            })
            .then((bid) => {
                console.log(bid)
                return dispatch({
                    type: types.UNIT_PLACE_BID,
                    bid: bid,
                    slot: slot,
                    unit: unit
                })
            })
            .catch((err) => {
                // TODO: notifications
                console.log('placeBid err', err)
            })
    }
}
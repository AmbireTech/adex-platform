import * as types from 'constants/actionTypes'
import { addImgFromObjectURL, getFileIpfsHash } from 'services/ipfs/ipfsService'

export function updateNewItem(item, newMeta) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_NEW_ITEM,
            item: item,
            meta: newMeta
        })
    }
}

export function resetNewItem(item) {
    return function (dispatch) {
        return dispatch({
            type: types.RESET_NEW_ITEM,
            item: item
        })
    }
}

export function addItem(item, itemToAddTo) {
    item = { ...item }
    return function (dispatch) {
        addImgFromObjectURL(item._meta.img.tempUrl)
            .then(function (imgIpfs) {
                // TODO: make function for this and check for ipfs errors
                item = { ...item }
                let meta = { ...item._meta }
                meta.img = { ipfs: imgIpfs }
                item._meta = meta
                return getFileIpfsHash(JSON.stringify(item._meta))
            })
            .then(function (metaIpfs) {
                // console.log('metaIpfs', metaIpfs)
                item._ipfs = metaIpfs
            })
            .then(function () {
                // TODO: Web3 service here
                dispatch({
                    type: types.ADD_ITEM,
                    item: item
                })

                if (itemToAddTo) {
                    item = { ...item }
                    item._id = item.tempId
                    return dispatch({
                        type: types.ADD_ITEM_TO_ITEM,
                        item: itemToAddTo,
                        toAdd: item, // TODO!!!
                    })
                } else {
                    return
                }
            })
            .catch(function (e) {
                console.error(e)
            })
    }
}

export function deleteItem(item) {
    return function (dispatch) {
        return dispatch({
            type: types.DELETE_ITEM,
            item: item
        })
    }
}

export function removeItemFromItem({ item, toRemove } = {}) {
    return function (dispatch) {
        return dispatch({
            type: types.REMOVE_ITEM_FROM_ITEM,
            item: item,
            toRemove: toRemove,
        })
    }
}

export function addItemToItem({ item, toAdd } = {}) {
    return function (dispatch) {
        return dispatch({
            type: types.ADD_ITEM_TO_ITEM,
            item: item,
            toAdd: toAdd,
        })
    }
}

export function updateItem(item, newMeta) {
    return function (dispatch) {
        setTimeout(() => {
            dispatch({
                type: types.UPDATE_ITEM,
                item: item,
                meta: newMeta
            })

        }, 3000)
    }
}

export function setCurrentItem(item) {
    return function (dispatch) {
        return dispatch({
            type: types.SET_CURRENT_ITEM,
            item: item
        })
    }
}

export function updateCurrentItem(item, newMeta) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_CURRENT_ITEM,
            item: item,
            meta: newMeta
        })
    }
}

export function placeBid(bid, slot) {
    return function (dispatch) {
        return dispatch({
            type: types.UNIT_PLACE_BID,
            bid: bid,
            slot: slot
        })
    }
}

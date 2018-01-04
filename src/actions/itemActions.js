import * as types from 'constants/actionTypes'
import { addImgFromObjectURL, getFileIpfsHash } from 'services/ipfs/ipfsService'
import { registerItem } from 'services/smart-contracts/actions/registry'

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

// register item
export function addItem(item, itemToAddTo, prKey, _addr) {
    item = { ...item }
    return function (dispatch) {
        addImgFromObjectURL(item._meta.img.tempUrl)
            .then((imgIpfs) => {
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
            .then(() => {
                return registerItem({ _type: item._type, _ipfs: 0, _name: item._name, _meta: 0, prKey: prKey, _addr: _addr })
            })
            .then(() => {
                // TODO: Web3 service here
                dispatch({
                    type: types.ADD_ITEM,
                    item: item
                })

                if (itemToAddTo) {
                    item = { ...item }
                    return dispatch({
                        type: types.ADD_ITEM_TO_ITEM,
                        item: itemToAddTo,
                        toAdd: item, // TODO!!!
                    })
                } else {
                    return
                }
            })
            .catch((e) => {
                console.error('addItem err', e)
            })
    }
}

export function deleteItem({ item, objModel } = {}) {
    return function (dispatch) {
        return dispatch({
            type: types.DELETE_ITEM,
            item: item,
            objModel: objModel
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

export function updateItem({ item, newMeta, objModel } = {}) {
    return function (dispatch) {
        setTimeout(() => {
            dispatch({
                type: types.UPDATE_ITEM,
                item: item,
                meta: newMeta,
                objModel: objModel
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

export const updateItems = ({ items, itemsType }) => {
    return (dispatch) => {
        return dispatch({
            type: types.UPDATE_ALL_ITEMS,
            items: items,
            itemsType: itemsType
        })
    }
}
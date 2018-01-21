import * as types from 'constants/actionTypes'
import { addImgFromObjectURL, getFileIpfsHash } from 'services/ipfs/ipfsService'
import { uploadImage, regItem } from 'services/adex-node/actions'

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
    // TODO: authentication

    return function (dispatch) {
        if (item._meta.img.tempUrl) {
            //TODO: Provide the blob to the store or request the image from the blob url as is now?

            fetch(item._meta.img.tempUrl)
                .then((resp) => {
                    return resp.blob()
                })
                .then((imgBlob) => {
                    return uploadImage({ imageBlob: imgBlob, imageName: 'image.png', userAddr: _addr })
                })
                .then((imgResp) => {
                    item._meta.img.ipfs = imgResp.ipfs
                    registerItem(item)
                })
                .catch((err) => {
                    console.log('fetch tempUrl err', err)
                })
        } else {
            registerItem(item)
        }

        function registerItem(item) {
            regItem({ item, userAddr: _addr })
                .then((item) => {
                    dispatch({
                        type: types.ADD_ITEM,
                        item: item
                    })
                })
                .catch((err) => {
                    console.log('registerItem err', err)
                })
        }
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
import * as types from 'constants/actionTypes'
import { addImgFromObjectURL, getFileIpfsHash } from 'services/ipfs/ipfsService'
import { uploadImage, regItem, delItem, addItmToItm, removeItmFromItm } from 'services/adex-node/actions'
import { ItemModelsByType } from 'constants/itemsTypes'
import { Base, Helper } from 'adex-models'

export function updateNewItem(item, newValues) {
    item = Base.updateObject({ item: item, newValues: newValues, objModel: Helper.modelByTypeId(item._type || item._meta.type) })
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_NEW_ITEM,
            item: item
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

    // console.log('item addItem', item)

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
                    registerItem(item, itemToAddTo)
                })
                .catch((err) => {
                    console.log('fetch tempUrl err', err)
                })
        } else {
            registerItem(item, itemToAddTo)
        }

        function registerItem(item, itemToAddTo) {

            regItem({ item, userAddr: _addr })
                .then((item) => {
                    let registeredItem = new ItemModelsByType[item.type](item)
                    dispatch({
                        type: types.ADD_ITEM,
                        item: registeredItem
                    })

                    if (itemToAddTo) {
                        // TODO: How to use addItemToItem action
                        addItmToItm({ item: registeredItem._id, collection: itemToAddTo._id || itemToAddTo, userAddr: registeredItem._meta.owner || registeredItem.user })
                            .then((res) => {
                                return dispatch({
                                    type: types.ADD_ITEM_TO_ITEM,
                                    item: registeredItem,
                                    toAdd: itemToAddTo,
                                })
                            })
                    }
                })
                .catch((err) => {
                    console.log('registerItem err', err)
                })
        }
    }
}

export function deleteItem({ item, objModel, _addr } = {}) {
    return function (dispatch) {
        delItem({
            id: item._id,
            type: item._meta.type,
            userAddr: item._meta.owner //TODO: use user from session
        })
            .then((res) => {
                console.log('deleteItem res', res)

                return dispatch({
                    type: types.DELETE_ITEM,
                    item: item,
                    objModel: objModel
                })

            })
            .catch((err) => {
                console.log('deleteItem err', err)
            })
    }
}

export function removeItemFromItem({ item, toRemove } = {}) {
    return function (dispatch) {
        removeItmFromItm({ item: item._id, collection: toRemove._id || toRemove, userAddr: item._meta.owner || item.user })
            .then((res) => {
                return dispatch({
                    type: types.REMOVE_ITEM_FROM_ITEM,
                    item: item,
                    toRemove: toRemove,
                })
            })
    }
}

export function addItemToItem({ item, toAdd } = {}) {
    return function (dispatch) {
        addItmToItm({ item: item._id, collection: toAdd._id || toAdd, userAddr: item._meta.owner || item.user })
            .then((res) => {
                //TODO: use response and UPDATE_ITEM
                return dispatch({
                    type: types.ADD_ITEM_TO_ITEM,
                    item: item,
                    toAdd: toAdd,
                })
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
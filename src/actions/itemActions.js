import * as types from 'constants/actionTypes'
import { uploadImage, regItem, delItem, addItmToItm, removeItmFromItm } from 'services/adex-node/actions'
import { Base, Models } from 'adex-models'
import { addActionToast } from './uiActions'

export function updateNewItem(item, newValues) {
    item = Base.updateObject({ item: item, newValues: newValues, objModel: Models.itemClassByTypeId[item._type || item._meta.type] })
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
export function addItem(item, itemToAddTo, authSig) {
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
                    return uploadImage({ imageBlob: imgBlob, imageName: 'image.png', authSig: authSig })
                })
                .then((imgResp) => {
                    item._meta.img.ipfs = imgResp.ipfs
                    delete item._meta.img.tempUrl
                    registerItem(item, itemToAddTo)
                })
                .catch((err) => {
                    return addActionToast({ dispatch: dispatch, type: 'warning', action: 'X', label: err, timeout: 5000 })
                })
        } else {
            registerItem(item, itemToAddTo)
        }

        function registerItem(item, itemToAddTo) {

            regItem({ item, authSig: authSig })
                .then((item) => {
                    let registeredItem = new Models.itemClassByTypeId[item.type](item)
                    dispatch({
                        type: types.ADD_ITEM,
                        item: registeredItem
                    })

                    if (itemToAddTo) {
                        // TODO: How to use addItemToItem action
                        addItmToItm({ item: registeredItem._id, collection: itemToAddTo._id || itemToAddTo, authSig: authSig })
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
                    return addActionToast({ dispatch: dispatch, type: 'warning', action: 'X', label: err, timeout: 5000 })
                })
        }
    }
}

export function deleteItem({ item, objModel, authSig } = {}) {
    return function (dispatch) {
        delItem({
            id: item._id,
            type: item._meta.type,
            authSig: authSig //TODO: use user from session
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

export function removeItemFromItem({ item, toRemove, authSig } = {}) {
    return function (dispatch) {
        removeItmFromItm({ item: item._id, collection: toRemove._id || toRemove, authSig: authSig })
            .then((res) => {
                return dispatch({
                    type: types.REMOVE_ITEM_FROM_ITEM,
                    item: item,
                    toRemove: toRemove,
                })
            })
    }
}

export function addItemToItem({ item, toAdd, authSig } = {}) {
    return function (dispatch) {
        addItmToItm({ item: item._id, collection: toAdd._id || toAdd, authSig: authSig })
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

export const resetAllItems = () => {
    return (dispatch) => {
        return dispatch({
            type: types.RESET_ALL_ITEMS
        })
    }
}
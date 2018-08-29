import * as types from 'constants/actionTypes'
import { uploadImage, regItem, delItem, addItmToItm, removeItmFromItm, updateItm } from 'services/adex-node/actions'
import { Base, Models } from 'adex-models'
import { addActionToast } from './uiActions'
import { translate } from 'services/translations/translations'
import { items as ItemsConstants } from 'adex-constants'

const { ItemTypesNames } = ItemsConstants

const addToast = ({type, toastStr, args, dispatch}) => {
    return addActionToast({ dispatch: dispatch, type: type, action: 'X', label: translate(toastStr, {args: args}), timeout: 5000 })
}

const getImgsIpfsFromBlob = ({ tempUrl, authSig }) => {
    return fetch(tempUrl)
        .then((resp) => {
            return resp.blob()
        })
        .then((imgBlob) => {
            URL.revokeObjectURL(tempUrl)
            return uploadImage({ imageBlob: imgBlob, imageName: 'image.png', authSig: authSig })
        })
}

const uploadImages = ({ item, authSig }) => {
    let imgIpfsProm = Promise.resolve()
    let fallbackImgIpfsProm = Promise.resolve()

    if (item._meta.img.tempUrl) {
        imgIpfsProm = getImgsIpfsFromBlob({ tempUrl: item._meta.img.tempUrl, authSig: authSig })
    }

    if (item._fallbackAdImg && item._fallbackAdImg.tempUrl) {
        fallbackImgIpfsProm = getImgsIpfsFromBlob({ tempUrl: item._fallbackAdImg.tempUrl, authSig: authSig })
    }

    return Promise.all([imgIpfsProm, fallbackImgIpfsProm])
        .then(([imgIpf, fallbackImgIpfs]) => {
            if (imgIpf) {
                item._meta.img = { ipfs: imgIpf.ipfs }
            }

            if (fallbackImgIpfs) {
                item._fallbackAdImg = { ipfs: fallbackImgIpfs.ipfs }
            }

            return item
        })
}

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
    return function (dispatch) {

        uploadImages({ item: item, authSig: authSig })
            .then((updatedItem) => {
                // registerItem(updatedItem, itemToAddTo)
                return regItem({ item: updatedItem, authSig: authSig })
            })
            .then((resItem) => {
                let registeredItem = new Models.itemClassByTypeId[item._type || item._meta.type](resItem)
                dispatch({
                    type: types.ADD_ITEM,
                    item: registeredItem
                })
                addToast({ dispatch: dispatch, type: 'accept', toastStr: 'SUCCESS_CREATING_ITEM', args: [ItemTypesNames[item._type], item._meta.fullName] })

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
                return addToast({ dispatch: dispatch, type: 'cancel', toastStr: 'ERR_CREATING_ITEM', args: [ItemTypesNames[item._type], err] })
            })
    }
}

export function removeItemFromItem({ item, toRemove, authSig } = {}) {
    return function (dispatch) {
        removeItmFromItm({ item: item._id, collection: toRemove._id || toRemove, authSig: authSig })
            .then((res) => {
                addToast({ dispatch: dispatch, type: 'accept', toastStr: 'SUCCESS_REMOVE_ITEM_FROM_ITEM', args: [ItemTypesNames[item._type], item._meta.fullName, ItemTypesNames[toRemove._type], toRemove._meta.fullName,] })
                return dispatch({
                    type: types.REMOVE_ITEM_FROM_ITEM,
                    item: item,
                    toRemove: toRemove,
                })
            })
            .catch((err) => {
                return addToast({ dispatch: dispatch, type: 'cancel', toastStr: 'ERR_REMOVE_ITEM_FROM_ITEM', args: [ItemTypesNames[item._type], ItemTypesNames[toRemove._type], err] })
            })
    }
}

export function addItemToItem({ item, toAdd, authSig } = {}) {
    return function (dispatch) {
        addItmToItm({ item: item._id, collection: toAdd._id || toAdd, authSig: authSig })
            .then((res) => {
                //TODO: use response and UPDATE_ITEM
                addToast({ dispatch: dispatch, type: 'accept', toastStr: 'SUCCESS_ADD_ITEM_TO_ITEM', args: [ItemTypesNames[item._type], item._meta.fullName, ItemTypesNames[toAdd._type], toAdd._meta.fullName,] })

                return dispatch({
                    type: types.ADD_ITEM_TO_ITEM,
                    item: item,
                    toAdd: toAdd,
                })
            })
            .catch((err) => {
                return addToast({ dispatch: dispatch, type: 'cancel', toastStr: 'ERR_ADD_ITEM_FROM_ITEM', args: [ItemTypesNames[item._type], ItemTypesNames[toAdd._type], err] })
            })
    }
}

// Accepts the entire new item and replace so be careful!
export function updateItem({ item, authSig, successMsg, errMsg } = {}) {
    return function (dispatch) {
        uploadImages({ item: { ...item }, authSig: authSig })
            .then((updatedItem) => {
                return updateItm({ item: updatedItem, authSig })
            })
            .then((res) => {
                dispatch({
                    type: types.UPDATE_ITEM,
                    item: res
                })

                addToast({ dispatch: dispatch, type: 'accept', toastStr: successMsg || 'SUCCESS_UPDATING_ITEM', args: [ItemTypesNames[item._type], item._meta.fullName] })

                return dispatch({
                    type: types.UPDATE_SPINNER,
                    spinner: 'update' + res._id,
                    value: false
                })

            })
            .catch((err) => {
                return addToast({ dispatch: dispatch, type: 'cancel', toastStr: errMsg || 'ERR_UPDATING_ITEM', args: [ItemTypesNames[item._type], item._meta.fullName, err] })
            })
    }
}

// export function deleteItem({ item, objModel, authSig } = {}) {
//     item = {...item}
//     item._deleted = true

//     return updateItem({ item: item, authSig: authSig, successMsg: 'SUCCESS_DELETING_ITEM', errMsg: 'ERR_DELETING_ITEM' })
// }

// export function restoreItem({ item, authSig } = {}) {
//     item = {...item}
//     item._deleted = false

//     return updateItem({ item: item, authSig: authSig, successMsg: 'SUCCESS_RESTORE_ITEM', errMsg: 'ERR_RESTORING_ITEM' })
// }

export function archiveItem({ item, authSig } = {}) {
    item = {...item}
    item._archived = true

    return updateItem({ item: item, authSig: authSig, successMsg: 'SUCCESS_ARCHIVING_ITEM', errMsg: 'ERR_ARCHIVING_ITEM' })
}

export function unarchiveItem({ item, authSig } = {}) {
    item = {...item}
    item._archived = false

    return updateItem({ item: item, authSig: authSig, successMsg: 'SUCCESS_UNARCHIVING_ITEM', errMsg: 'ERR_UNARCHIVING_ITEM' })
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

export const updateTags = ({ tags }) => {
    return (dispatch) => {
        return dispatch({
            type: types.UPDATE_TAGS,
            tags: tags
        })
    }
}

export const addNewTag = ({ tag }) => {
    return (dispatch) => {
        return dispatch({
            type: types.ADD_NEW_TAG,
            tag: tag
        })
    }
}
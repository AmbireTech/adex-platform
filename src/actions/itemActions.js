import * as types from 'constants/actionTypes'
import { uploadImage, postAdUnit, postAdSlot } from 'services/adex-market/actions'
import { Base, AdSlot, AdUnit } from 'adex-models'
import { addToast as AddToastUi } from './uiActions'
import { translate } from 'services/translations/translations'
import { getAdUnits, getAdSlots, getCampaigns } from 'services/adex-market/actions'
import { openChannel } from 'services/smart-contracts/actions/core'

const addToast = ({ type, toastStr, args, dispatch }) => {
	return AddToastUi({ dispatch: dispatch, type: type, action: 'X', label: translate(toastStr, { args: args }), timeout: 5000 })(dispatch)
}

const getImgsIpfsFromBlob = ({ tempUrl, authSig }) => {
	return fetch(tempUrl)
		.then((resp) => {
			return resp.blob()
		})
		.then((imgBlob) => {
			URL.revokeObjectURL(tempUrl)
			return uploadImage({ imageBlob: imgBlob, imageName: 'image.jpeg', authSig: authSig })
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

export function updateNewItem(item, newValues, itemType, objModel) {
	item = Base.updateObject({ item, newValues, objModel })
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_NEW_ITEM,
			item,
			itemType
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
export function addItem(item, itemType, authSig) {
	const newItem = { ...item }
	return async function (dispatch) {

		try {
			const imageIpfs = (await getImgsIpfsFromBlob({
				tempUrl: newItem.temp.tempUrl,
				authSig
			})).ipfs

			newItem.mediaUrl = `ipfs://${imageIpfs}`
			newItem.mediaMime = newItem.temp.mime
			newItem.created = Date.now()

			const resItem = await postAdUnit({
				unit: new AdUnit(newItem).marketAdd,
				authSig
			})

			dispatch({
				type: types.ADD_ITEM,
				item: resItem,
				itemType: 'AdUnit'
			})

			addToast({ dispatch: dispatch, type: 'accept', toastStr: 'SUCCESS_CREATING_ITEM', args: ['AdUnit', newItem.title] })
		} catch (err) {
			console.error('ERR_CREATING_ITEM', err)
			addToast({ dispatch: dispatch, type: 'cancel', toastStr: 'ERR_CREATING_ITEM', args: ['AdUnit', err] })
		}
	}
}

export function addSlot(item, itemType, authSig) {
	const newItem = { ...item }
	return async function (dispatch) {

		try {
			const imageIpfs = (await getImgsIpfsFromBlob({
				tempUrl: newItem.temp.tempUrl,
				authSig
			})).ipfs

			newItem.fallbackMediaUrl = `ipfs://${imageIpfs}`
			newItem.fallbackMediaMime = newItem.temp.mime
			newItem.created = Date.now()

			const resItem = await postAdSlot({
				slot: new AdSlot(newItem).marketAdd,
				authSig
			})

			dispatch({
				type: types.ADD_ITEM,
				item: resItem,
				itemType: 'AdSlot'
			})

			addToast({ dispatch: dispatch, type: 'accept', toastStr: 'SUCCESS_CREATING_ITEM', args: ['AdUnit', newItem.title] })
		} catch (err) {
			console.error('ERR_CREATING_ITEM', err)
			addToast({ dispatch: dispatch, type: 'cancel', toastStr: 'ERR_CREATING_ITEM', args: ['AdUnit', err] })
		}
	}
}

export function getAllItems() {
	return async function (dispatch, getState) {
		try {
			const { authSig } = getState().persist.account.wallet
			const units = getAdUnits({ authSig })
			const slots = getAdSlots({ authSig })
			const campaigns = getCampaigns({ authSig })

			const [resUnits, resSlots, resCampaigns]
				= await Promise.all([units, slots, campaigns])

			const campaignsMapped = resCampaigns.map(c => {
				return { ...c, ...c.spec }
			})

			updateItems({ items: resUnits, itemType: 'AdUnit' })(dispatch)
			updateItems({ items: resSlots, itemType: 'AdSlot' })(dispatch)
			updateItems({ items: campaignsMapped, itemType: 'Campaign' })(dispatch)
		} catch (err) {
			console.error('ERR_GETTING_ITEMS', err)
			addToast({
				dispatch,
				type: 'cancel',
				toastStr: 'ERR_GETTING_ITEMS',
				args: [err]
			})
		}
	}
}

export function openCampaign({ campaign, account }) {
	return async function (dispatch) {
		try {
			const resCampaign = await openChannel({ campaign, account })

			dispatch({
				type: types.ADD_ITEM,
				item: resCampaign,
				itemType: 'Campaign'
			})

		} catch (err) {
			console.error('ERR_OPENING_CAMPAIGN', err)
			addToast({
				dispatch,
				type: 'cancel',
				toastStr: 'ERR_OPENING_CAMPAIGN',
				args: [err]
			})
		}
	}
}

export function removeItemFromItem({ item, toRemove, authSig } = {}) {
	return function (dispatch) {
		// removeItmFromItm({ item: item._id, collection: toRemove._id || toRemove, authSig: authSig })
		// 	.then((res) => {
		// 		addToast({ dispatch: dispatch, type: 'accept', toastStr: 'SUCCESS_REMOVE_ITEM_FROM_ITEM', args: [ItemTypesNames[item._type], item._meta.fullName, ItemTypesNames[toRemove._type], toRemove._meta.fullName,] })
		// 		return dispatch({
		// 			type: types.REMOVE_ITEM_FROM_ITEM,
		// 			item: item,
		// 			toRemove: toRemove,
		// 		})
		// 	})
		// 	.catch((err) => {
		// 		return addToast({ dispatch: dispatch, type: 'cancel', toastStr: 'ERR_REMOVE_ITEM_FROM_ITEM', args: [ItemTypesNames[item._type], ItemTypesNames[toRemove._type], err] })
		// 	})
	}
}

export function addItemToItem({ item, toAdd, authSig } = {}) {
	return function (dispatch) {
		// addItmToItm({ item: item._id, collection: toAdd._id || toAdd, authSig: authSig })
		// 	.then((res) => {
		// 		//TODO: use response and UPDATE_ITEM
		// 		addToast({ dispatch: dispatch, type: 'accept', toastStr: 'SUCCESS_ADD_ITEM_TO_ITEM', args: [ItemTypesNames[item._type], item._meta.fullName, ItemTypesNames[toAdd._type], toAdd._meta.fullName,] })

		// 		return dispatch({
		// 			type: types.ADD_ITEM_TO_ITEM,
		// 			item: item,
		// 			toAdd: toAdd,
		// 		})
		// 	})
		// 	.catch((err) => {
		// 		return addToast({ dispatch: dispatch, type: 'cancel', toastStr: 'ERR_ADD_ITEM_FROM_ITEM', args: [ItemTypesNames[item._type], ItemTypesNames[toAdd._type], err] })
		// 	})
	}
}

// Accepts the entire new item and replace so be careful!
export function updateItem({ item, authSig, successMsg, errMsg } = {}) {
	return function (dispatch) {
		// uploadImages({ item: { ...item }, authSig: authSig })
		// 	.then((updatedItem) => {
		// 		return updateItm({ item: updatedItem, authSig })
		// 	})
		// 	.then((res) => {
		// 		dispatch({
		// 			type: types.UPDATE_ITEM,
		// 			item: res
		// 		})

		// 		addToast({ dispatch: dispatch, type: 'accept', toastStr: successMsg || 'SUCCESS_UPDATING_ITEM', args: [ItemTypesNames[item._type], item._meta.fullName] })

		// 		return dispatch({
		// 			type: types.UPDATE_SPINNER,
		// 			spinner: 'update' + res._id,
		// 			value: false
		// 		})

		// 	})
		// 	.catch((err) => {
		// 		return addToast({ dispatch: dispatch, type: 'cancel', toastStr: errMsg || 'ERR_UPDATING_ITEM', args: [ItemTypesNames[item._type], item._meta.fullName, err] })
		// 	})
	}
}

export function deleteItem({ item, objModel, authSig } = {}) {
	item = { ...item }
	item._deleted = true

	// return updateItem({ item: item, authSig: authSig, successMsg: 'SUCCESS_DELETING_ITEM', errMsg: 'ERR_DELETING_ITEM' })
}

export function restoreItem({ item, authSig } = {}) {
	item = { ...item }
	item._deleted = false

	return updateItem({ item: item, authSig: authSig, successMsg: 'SUCCESS_RESTORE_ITEM', errMsg: 'ERR_RESTORING_ITEM' })
}

export function archiveItem({ item, authSig } = {}) {
	item = { ...item }
	item._archived = true

	return updateItem({ item: item, authSig: authSig, successMsg: 'SUCCESS_ARCHIVING_ITEM', errMsg: 'ERR_ARCHIVING_ITEM' })
}

export function unarchiveItem({ item, authSig } = {}) {
	item = { ...item }
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

export function updateItems({ items, itemType }) {
	return (dispatch) => {
		return dispatch({
			type: types.UPDATE_ALL_ITEMS,
			items: items,
			itemType: itemType
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

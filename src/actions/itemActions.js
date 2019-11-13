import * as types from 'constants/actionTypes'
import {
	uploadImage,
	postAdUnit,
	postAdSlot,
	updateAdSlot,
	updateAdUnit,
	getImageCategories,
} from 'services/adex-market/actions'
import { parseUnits, bigNumberify } from 'ethers/utils'
import { Base, AdSlot, AdUnit, helpers } from 'adex-models'
import { addToast as AddToastUi, updateSpinner } from './uiActions'
import { updateValidatorAuthTokens } from './accountActions'
import { translate } from 'services/translations/translations'
import { getAllValidatorsAuthForIdentity } from 'services/smart-contracts/actions/stats'
import {
	getAdUnits,
	getAdSlots,
	// getCampaigns,
} from 'services/adex-market/actions'
import {
	openChannel,
	closeChannel,
} from 'services/smart-contracts/actions/core'
import { lastApprovedState } from 'services/adex-validator/actions'
import initialState from 'store/initialState'
import { getMediaSize } from 'helpers/mediaHelpers'

import { contracts } from 'services/smart-contracts/contractsCfg'
import { SOURCES } from 'constants/targeting'
const { DAI } = contracts

const addToast = ({ type, toastStr, args, dispatch }) => {
	return AddToastUi({
		dispatch: dispatch,
		type: type,
		action: 'X',
		label: translate(toastStr, { args: args }),
		timeout: 5000,
	})(dispatch)
}

const getImgsIpfsFromBlob = ({ tempUrl, authSig }) => {
	return fetch(tempUrl)
		.then(resp => {
			return resp.blob()
		})
		.then(imgBlob => {
			URL.revokeObjectURL(tempUrl)
			return uploadImage({
				imageBlob: imgBlob,
				imageName: 'image.jpeg',
				authSig: authSig,
			})
		})
}

// const uploadImages = ({ item, authSig }) => {
// 	let imgIpfsProm = Promise.resolve()
// 	let fallbackImgIpfsProm = Promise.resolve()

// 	if (item._meta.img.tempUrl) {
// 		imgIpfsProm = getImgsIpfsFromBlob({ tempUrl: item._meta.img.tempUrl, authSig: authSig })
// 	}

// 	if (item._fallbackAdImg && item._fallbackAdImg.tempUrl) {
// 		fallbackImgIpfsProm = getImgsIpfsFromBlob({ tempUrl: item._fallbackAdImg.tempUrl, authSig: authSig })
// 	}

// 	return Promise.all([imgIpfsProm, fallbackImgIpfsProm])
// 		.then(([imgIpf, fallbackImgIpfs]) => {
// 			if (imgIpf) {
// 				item._meta.img = { ipfs: imgIpf.ipfs }
// 			}

// 			if (fallbackImgIpfs) {
// 				item._fallbackAdImg = { ipfs: fallbackImgIpfs.ipfs }
// 			}

// 			return item
// 		})
// }

export function updateNewItem(item, newValues, itemType, objModel) {
	item = Base.updateObject({ item, newValues, objModel })
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_NEW_ITEM,
			item,
			itemType,
		})
	}
}

export function resetNewItem(item) {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_NEW_ITEM,
			item: item,
		})
	}
}

export function resetAllNewItems() {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_ALL_NEW_ITEMS,
		})
	}
}

// register item
export function addItem(item, itemType, authSig) {
	const newItem = { ...item }
	return async function(dispatch) {
		try {
			const imageIpfs = (await getImgsIpfsFromBlob({
				tempUrl: newItem.temp.tempUrl,
				authSig,
			})).ipfs

			newItem.mediaUrl = `ipfs://${imageIpfs}`
			newItem.mediaMime = newItem.temp.mime
			newItem.created = Date.now()

			const resItem = await postAdUnit({
				unit: new AdUnit(newItem).marketAdd,
				authSig,
			})

			dispatch({
				type: types.ADD_ITEM,
				item: new AdUnit(resItem).plainObj(),
				itemType: 'AdUnit',
			})

			addToast({
				dispatch: dispatch,
				type: 'accept',
				toastStr: 'SUCCESS_CREATING_ITEM',
				args: ['AdUnit', newItem.title],
			})
		} catch (err) {
			console.error('ERR_CREATING_ITEM', err)
			addToast({
				dispatch: dispatch,
				type: 'cancel',
				toastStr: 'ERR_CREATING_ITEM',
				args: ['AdUnit', err],
			})
		}
	}
}

export function addSlot(item, itemType, authSig) {
	const newItem = { ...item }
	return async function(dispatch) {
		try {
			let fallbackUnit = null
			if (newItem.temp.useFallback) {
				const imageIpfs = (await getImgsIpfsFromBlob({
					tempUrl: newItem.temp.tempUrl,
					authSig,
				})).ipfs

				const unit = new AdUnit({
					type: newItem.type,
					mediaUrl: `ipfs://${imageIpfs}`,
					targetUrl: newItem.targetUrl,
					mediaMime: newItem.temp.mime,
					created: Date.now(),
					title: newItem.title,
					description: newItem.description,
					targeting: [],
					tags: [],
					passback: true,
				})

				const resUnit = await postAdUnit({
					unit: unit.marketAdd,
					authSig,
				})

				fallbackUnit = resUnit.ipfs
			}

			newItem.fallbackUnit = fallbackUnit
			newItem.created = Date.now()

			if (newItem.temp.minPerImpression) {
				newItem.minPerImpression = {
					[DAI.address]: parseUnits(newItem.temp.minPerImpression, DAI.decimals)
						.div(bigNumberify(1000))
						.toString(),
				}
			}

			const resItem = await postAdSlot({
				slot: new AdSlot(newItem).marketAdd,
				authSig,
			})

			dispatch({
				type: types.ADD_ITEM,
				item: new AdSlot(resItem).plainObj(),
				itemType: 'AdSlot',
			})

			addToast({
				dispatch: dispatch,
				type: 'accept',
				toastStr: 'SUCCESS_CREATING_ITEM',
				args: ['AdSlot', newItem.title],
			})
		} catch (err) {
			console.error('ERR_CREATING_ITEM', err)
			addToast({
				dispatch: dispatch,
				type: 'cancel',
				toastStr: 'ERR_CREATING_ITEM',
				args: ['AdSlot', err],
			})
		}
	}
}

export function getAllItems() {
	return async function(dispatch, getState) {
		try {
			const { account } = getState().persist
			// const { authSig } = account.wallet
			const { address } = account.identity
			const units = getAdUnits({ identity: address })
			const slots = getAdSlots({ identity: address })
			// const campaigns = getCampaigns({ authSig })

			const [
				resUnits,
				resSlots,
				// resCampaigns,
			] = await Promise.all([
				units,
				slots,
				//	campaigns
			])

			// const campaignsMapped = resCampaigns.map(c => {
			// 	return { ...c, ...c.spec }
			// })

			updateItems({ items: resUnits, itemType: 'AdUnit' })(dispatch)
			updateItems({ items: resSlots, itemType: 'AdSlot' })(dispatch)
			// updateItems({ items: campaignsMapped, itemType: 'Campaign' })(dispatch)
		} catch (err) {
			console.error('ERR_GETTING_ITEMS', err)
			addToast({
				dispatch,
				type: 'cancel',
				toastStr: 'ERR_GETTING_ITEMS',
				args: [err],
			})
		}
	}
}

export function getCategorySuggestions({ newItem, itemType }) {
	return async function(dispatch) {
		updateSpinner('targeting-suggestions', true)(dispatch)
		const tempItem = newItem
		const { tempUrl } = tempItem.temp
		try {
			const response = await getImageCategories({ tempUrl })
			if (response) {
				const newTargets = response.categories.map(i => ({
					tag: i.name,
					score: Math.round(i.confidence * 100),
				}))
				const targetsWithSource = newTargets.map((t, index) => {
					return {
						key: index,
						collection: 'targeting',
						source: 'custom',
						label: translate(`TARGET_LABEL_GOOGLE_VISION`),
						placeholder: translate(`TARGET_LABEL_GOOGLE_VISION`),
						target: { ...t },
					}
				})
				addToast({
					dispatch: dispatch,
					type: 'accept',
					toastStr: 'ADDED_CATEGORY_SUGGESTIONS_IF_MISSING',
					args: [targetsWithSource.length],
				})
				updateSpinner('targeting-suggestions', false)(dispatch)
				return targetsWithSource
			}
		} catch (err) {
			console.error('ERR_GETTING_CATEGORY_SUGGESTIONS', err)
			addToast({
				dispatch,
				type: 'cancel',
				toastStr: 'ERR_GETTING_CATEGORY_SUGGESTIONS',
				args: [err],
			})
			return []
		}
		updateSpinner('targeting-suggestions', false)(dispatch)
	}
}

export function openCampaign({ campaign, account }) {
	return async function(dispatch) {
		updateSpinner('opening-campaign', true)(dispatch)
		try {
			await getAllValidatorsAuthForIdentity({
				withBalance: [{ channel: campaign }],
				account,
			})

			const { readyCampaign } = await openChannel({ campaign, account })

			dispatch({
				type: types.ADD_ITEM,
				item: readyCampaign,
				itemType: 'Campaign',
			})
			addToast({
				dispatch: dispatch,
				type: 'accept',
				toastStr: 'OPENING_CAMPAIGN_SENT_TO_RELAYER',
				args: [readyCampaign.id],
			})
		} catch (err) {
			console.error('ERR_OPENING_CAMPAIGN', err)
			addToast({
				dispatch,
				type: 'cancel',
				toastStr: 'ERR_OPENING_CAMPAIGN',
				args: [err],
			})
		}
		updateSpinner('opening-campaign', false)(dispatch)
		return true
	}
}

export function removeItemFromItem({ item, toRemove, authSig } = {}) {
	return function(dispatch) {
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
	return function(dispatch) {
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
export function updateItem({ item, itemType } = {}) {
	return async function(dispatch, getState) {
		updateSpinner('update' + item.id, true)(dispatch)
		try {
			const { account } = getState().persist
			const { authSig } = account.wallet

			let updatedItem = null
			let objModel = null

			const { id } = item

			switch (itemType) {
				case 'AdSlot':
					if (item.temp.minPerImpression) {
						item.minPerImpression = {
							[DAI.address]: parseUnits(
								item.temp.minPerImpression,
								DAI.decimals
							)
								.div(bigNumberify(1000))
								.toString(),
						}
					}
					const slot = new AdSlot(item).marketUpdate
					updatedItem = (await updateAdSlot({ slot, id, authSig })).slot
					objModel = AdSlot
					break
				case 'AdUnit':
					const unit = new AdUnit(item).marketUpdate
					updatedItem = (await updateAdUnit({ unit, id, authSig })).unit
					objModel = AdUnit
					break
				default:
					throw new Error(translate('INVALID_ITEM_TYPE'))
			}

			dispatch({
				type: types.UPDATE_ITEM,
				item: new objModel(updatedItem).plainObj(),
				itemType,
			})

			addToast({
				dispatch,
				type: 'accept',
				toastStr: 'SUCCESS_UPDATING_ITEM',
				args: [itemType, item.title],
			})
		} catch (err) {
			console.error('ERR_UPDATING_ITEM', err)
			addToast({
				dispatch,
				type: 'cancel',
				toastStr: 'ERR_UPDATING_ITEM',
				args: [itemType, err],
			})
		}
		updateSpinner('update' + item.id, false)(dispatch)
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

	return updateItem({
		item: item,
		authSig: authSig,
		successMsg: 'SUCCESS_RESTORE_ITEM',
		errMsg: 'ERR_RESTORING_ITEM',
	})
}

const findSourceByTag = tag => {
	return Object.keys(SOURCES).find(
		item => SOURCES[item].src.filter(data => data.value === tag).length > 0
	)
}

export function cloneItem({ item, itemType, objModel } = {}) {
	return async function(dispatch) {
		try {
			const newItem = Base.updateObject({ item, objModel })
			newItem.id = ''
			newItem.temp = {
				...initialState.newItem[itemType].temp,
				targets: item.targeting.map((t, index) => {
					const key = findSourceByTag(t.tag) || ''
					return {
						key: index,
						collection: 'targeting',
						source: key,
						label: translate(`TARGET_LABEL_${key.toUpperCase()}`),
						placeholder: translate(`TARGET_LABEL_${key.toUpperCase()}`),
						target: { ...t },
					}
				}),
			}

			const tempUrl = helpers.getMediaUrlWithProvider(
				newItem.mediaUrl,
				process.env.IPFS_GATEWAY
			)

			const response = await fetch(tempUrl)
			const mediaURL = URL.createObjectURL(await response.blob())
			const mediaSize = await getMediaSize({
				mime: newItem.mediaMime,
				src: mediaURL,
			})

			const temp = {
				...newItem.temp,
				mime: item.mediaMime,
				tempUrl: mediaURL,
				width: mediaSize.width,
				height: mediaSize.height,
			}

			newItem.temp = temp

			dispatch({
				type: types.UPDATE_NEW_ITEM,
				item: newItem,
				itemType,
			})
		} catch (err) {
			console.error(err)
			addToast({
				dispatch: dispatch,
				type: 'cancel',
				toastStr: 'ERR_CLONING_ITEM',
				args: [itemType, err],
			})
		}
	}
}

export function archiveItem({ item, authSig } = {}) {
	item = { ...item }
	item._archived = true

	return updateItem({
		item: item,
		authSig: authSig,
		successMsg: 'SUCCESS_ARCHIVING_ITEM',
		errMsg: 'ERR_ARCHIVING_ITEM',
	})
}

export function unarchiveItem({ item, authSig } = {}) {
	item = { ...item }
	item._archived = false

	return updateItem({
		item: item,
		authSig: authSig,
		successMsg: 'SUCCESS_UNARCHIVING_ITEM',
		errMsg: 'ERR_UNARCHIVING_ITEM',
	})
}

export function setCurrentItem(item) {
	return function(dispatch) {
		return dispatch({
			type: types.SET_CURRENT_ITEM,
			item: item,
		})
	}
}

export function updateCurrentItem(item, newMeta) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_CURRENT_ITEM,
			item: item,
			meta: newMeta,
		})
	}
}

export function updateItems({ items, itemType }) {
	return dispatch => {
		return dispatch({
			type: types.UPDATE_ALL_ITEMS,
			items: items,
			itemType: itemType,
		})
	}
}

export const resetAllItems = () => {
	return dispatch => {
		return dispatch({
			type: types.RESET_ALL_ITEMS,
		})
	}
}

export const updateTags = ({ tags }) => {
	return dispatch => {
		return dispatch({
			type: types.UPDATE_TAGS,
			tags: tags,
		})
	}
}

export const addNewTag = ({ tag }) => {
	return dispatch => {
		return dispatch({
			type: types.ADD_NEW_TAG,
			tag: tag,
		})
	}
}

export const updateCampaignState = ({ campaign }) => {
	return async dispatch => {
		try {
			const state = await lastApprovedState({ campaign })
			const newCampaign = { ...campaign }
			newCampaign.state = state

			return dispatch({
				type: types.UPDATE_ITEM,
				item: newCampaign,
				itemType: 'Campaign',
			})
		} catch (err) {
			console.error('ERR_GETTING_CAMPAIGN_LAST_STATUS', err)
			addToast({
				dispatch: dispatch,
				type: 'cancel',
				toastStr: 'ERR_GETTING_CAMPAIGN_LAST_STATUS',
				args: [err],
			})
		}
	}
}

export function closeCampaign({ campaign }) {
	return async function(dispatch, getState) {
		updateSpinner('closing-campaign', true)(dispatch)
		try {
			const { account } = getState().persist
			const { results, authTokens } = await closeChannel({ account, campaign })

			updateValidatorAuthTokens({ newAuth: authTokens })(dispatch)
			// TODO: update campaign state

			addToast({
				dispatch,
				type: 'accept',
				toastStr: 'SUCCESS_CLOSING_CAMPAIGN',
				args: [campaign.id],
			})
		} catch (err) {
			console.error('ERR_CLOSING_CAMPAIGN', err)
			addToast({
				dispatch,
				type: 'cancel',
				toastStr: 'ERR_CLOSING_CAMPAIGN',
				args: [err],
			})
		}
		updateSpinner('closing-campaign', false)(dispatch)
	}
}

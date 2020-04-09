import * as types from 'constants/actionTypes'
import {
	uploadImage,
	updateAdSlot,
	updateAdUnit,
	updateCampaign,
} from 'services/adex-market/actions'
import { Base, AdSlot, AdUnit, helpers, Campaign } from 'adex-models'
import { addToast as AddToastUi, updateSpinner } from './uiActions'

import { translate } from 'services/translations/translations'
import {
	getAdUnits,
	getAdSlots,
	getAdUnitById,
} from 'services/adex-market/actions'

import initialState from 'store/initialState'
import { getMediaSize } from 'helpers/mediaHelpers'
import { getErrorMsg } from 'helpers/errors'
import { numStringCPMtoImpression } from 'helpers/numbers'
import { SOURCES } from 'constants/targeting'
import { selectRelayerConfig, selectAccount, selectAuth } from 'selectors'

const addToast = ({ type, toastStr, args, dispatch }) => {
	return AddToastUi({
		dispatch: dispatch,
		type: type,
		label: translate(toastStr, { args: args }),
		timeout: 5000,
	})(dispatch)
}

export const getImgsIpfsFromBlob = ({ tempUrl, authSig }) => {
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

export function getAllItems() {
	return async function(dispatch, getState) {
		try {
			const account = selectAccount(getState())
			const { address } = account.identity
			const units = getAdUnits({ identity: address })
			const slots = getAdSlots({ identity: address })

			const [resUnits, resSlots] = await Promise.all([units, slots])
			const userSlots = resSlots.slots || []
			const userPassbackUnits = (resSlots.passbackUnits || []).reduce(
				(passbacks, u) => {
					const { id, mediaMime, mediaUrl, targetUrl } = u
					passbacks[id] = { mediaMime, mediaUrl, targetUrl }

					return passbacks
				},
				{}
			)

			const slotsWithUnits = userSlots.map(async s => ({
				...s,
				...(s.fallbackUnit ? userPassbackUnits[s.fallbackUnit] : {}),
			}))

			const slotWithUnitsRes = await Promise.all(slotsWithUnits)
			if (selectAuth(getState())) {
				updateItems({ items: resUnits, itemType: 'AdUnit' })(dispatch)
				updateItems({
					items: slotWithUnitsRes,
					itemType: 'AdSlot',
				})(dispatch)
				updateItems({ items: resSlots.websites || [], itemType: 'Website' })(
					dispatch
				)
			}
		} catch (err) {
			console.error('ERR_GETTING_ITEMS', err)
			addToast({
				dispatch,
				type: 'cancel',
				toastStr: 'ERR_GETTING_ITEMS',
				args: [getErrorMsg(err)],
			})
		}
	}
}

// Accepts the entire new item and replace so be careful!
export function updateItem({ item, itemType } = {}) {
	return async function(dispatch, getState) {
		const { id } = item
		updateSpinner('update' + id, true)(dispatch)
		try {
			const { account } = getState().persist
			const { authSig } = account.wallet
			const { mainToken } = selectRelayerConfig()

			const newItem = { ...item }
			let updatedItem = null
			let objModel = null

			switch (itemType) {
				case 'AdSlot':
					if (typeof newItem.temp.minPerImpression === 'string') {
						newItem.minPerImpression = {
							[mainToken.address]: numStringCPMtoImpression({
								numStr: newItem.temp.minPerImpression,
								decimals: mainToken.decimals,
							}),
						}
					}
					if (typeof newItem.temp.website === 'string') {
						newItem.website = newItem.temp.website
					}
					// In case newItem.website is null (very few slots)
					newItem.website = newItem.website || ''
					const slot = new AdSlot(newItem).marketUpdate
					updatedItem = (await updateAdSlot({ slot, id, authSig })).slot
					objModel = AdSlot
					break
				case 'AdUnit':
					const unit = new AdUnit(newItem).marketUpdate
					updatedItem = (await updateAdUnit({ unit, id, authSig })).unit
					objModel = AdUnit
					break
				case 'Campaign':
					const campaign = new Campaign(newItem).marketUpdate
					updatedItem = (await updateCampaign({ campaign, id, authSig }))
						.campaign
					objModel = Campaign
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

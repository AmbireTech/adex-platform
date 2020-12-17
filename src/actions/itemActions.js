import * as types from 'constants/actionTypes'
import {
	getAdUnits,
	getAdSlots,
	getUserAudiences,
	uploadImage,
	updateAdSlot,
	updateAdUnit,
	updateCampaign,
	putAudience,
} from 'services/adex-market/actions'
import { execute, addToast as AddToastUi, updateSpinner } from 'actions'
import { push } from 'connected-react-router'
import { Base, AdSlot, AdUnit, helpers, Campaign, Audience } from 'adex-models'

import { translate } from 'services/translations/translations'

import initialState from 'store/initialState'
import { getMediaSize } from 'helpers/mediaHelpers'
import { getErrorMsg } from 'helpers/errors'
import { SOURCES } from 'constants/targeting'
import { selectAccount, selectAuth, selectItemByTypeAndId } from 'selectors'

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

export function getAllItems(onDataUpdated) {
	return async function(dispatch, getState) {
		try {
			const account = selectAccount(getState())
			const { address } = account.identity
			const units = getAdUnits({ identity: address })
			const slots = getAdSlots({ identity: address })
			const audiences = getUserAudiences()

			const [resAudiences, resUnits, resSlots] = await Promise.all([
				audiences,
				units,
				slots,
			])
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
				updateItems({
					items: resAudiences.audiences,
					itemType: 'Audience',
				})(dispatch)
				updateItems({ items: resUnits, itemType: 'AdUnit' })(dispatch)
				updateItems({
					items: slotWithUnitsRes,
					itemType: 'AdSlot',
				})(dispatch)
				updateItems({ items: resSlots.websites || [], itemType: 'Website' })(
					dispatch
				)
				if (typeof onDataUpdated === 'function') {
					onDataUpdated()
				}
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
export function updateItem({
	item,
	itemType,
	action = 'UPDATING',
	onSuccess,
	goToTableOnSuccess = false,
} = {}) {
	return async function(dispatch, getState) {
		const { id } = item
		updateSpinner(action + id, true)(dispatch)
		try {
			const newItem = { ...item }
			let updatedItem = null
			let objModel = null
			let path = ''

			switch (itemType) {
				case 'AdSlot': // In case newItem.website is null (very few slots)
					newItem.website = newItem.website || ''
					const slot = new AdSlot(newItem).marketUpdate
					updatedItem = (await updateAdSlot({ slot, id })).slot
					objModel = AdSlot
					path = '/dashboard/publisher/slots'
					break
				case 'AdUnit':
					const unit = new AdUnit(newItem).marketUpdate
					updatedItem = (await updateAdUnit({ unit, id })).unit
					objModel = AdUnit
					path = '/dashboard/advertiser/units'
					break
				case 'Campaign':
					const campaign = new Campaign(newItem).marketUpdate
					updatedItem = (await updateCampaign({ campaign, id })).campaign
					objModel = Campaign
					path = '/dashboard/advertiser/campaigns'
					break

				case 'Audience':
					const audience = new Audience(newItem).marketUpdate
					updatedItem = (await putAudience({ audience, id })).audience
					objModel = Audience
					path = '/dashboard/advertiser/audiences'
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
				toastStr: `SUCCESS_${action}_ITEM`,
				args: [itemType, item.title],
			})

			if (goToTableOnSuccess) {
				execute(push(path))
			}
		} catch (err) {
			console.error(`ERR_${action}_ITEM`, err)
			addToast({
				dispatch,
				type: 'cancel',
				toastStr: `ERR_${action}_ITEM`,
				args: [itemType, err],
			})
		}
		updateSpinner(action + item.id, false)(dispatch)
	}
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

export function archiveItem({ itemId, itemType, goToTableOnSuccess } = {}) {
	return async function(dispatch, getState) {
		const selectedItem = selectItemByTypeAndId(getState(), itemType, itemId)
		const item = { ...selectedItem }
		item.archived = true

		await updateItem({
			item,
			itemType,
			action: 'ARCHIVING',
			goToTableOnSuccess,
		})(dispatch, getState)
	}
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

export const addNewTag = ({ tag }) => {
	return dispatch => {
		return dispatch({
			type: types.ADD_NEW_TAG,
			tag: tag,
		})
	}
}

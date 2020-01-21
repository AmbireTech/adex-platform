import * as types from 'constants/actionTypes'
import {
	uploadImage,
	postAdUnit,
	postAdSlot,
	updateAdSlot,
	updateAdUnit,
	updateCampaign,
} from 'services/adex-market/actions'
import { execute } from 'actions'
import { push } from 'connected-react-router'
import { parseUnits, bigNumberify } from 'ethers/utils'
import { Base, AdSlot, AdUnit, helpers, Campaign } from 'adex-models'
import { addToast as AddToastUi, updateSpinner } from './uiActions'
import { updateValidatorAuthTokens } from './accountActions'
import { translate } from 'services/translations/translations'
import { getAllValidatorsAuthForIdentity } from 'services/smart-contracts/actions/stats'
import {
	getAdUnits,
	getAdSlots,
	getCampaigns,
} from 'services/adex-market/actions'
import {
	openChannel,
	closeChannel,
} from 'services/smart-contracts/actions/core'
import {
	lastApprovedState,
	campaignAnalytics,
} from 'services/adex-validator/actions'
import { closeCampaignMarket } from 'services/adex-market/actions'
import initialState from 'store/initialState'
import { getMediaSize } from 'helpers/mediaHelpers'
import { getErrorMsg } from 'helpers/errors'
import { SOURCES } from 'constants/targeting'
import {
	selectAccount,
	selectRelayerConfig,
	selectCampaigns,
	selectAuthSig,
	selectAuth,
} from 'selectors'

const addToast = ({ type, toastStr, args, dispatch }) => {
	return AddToastUi({
		dispatch: dispatch,
		type: type,
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
export function addUnit(item) {
	const newItem = { ...item }
	return async function(dispatch, getState) {
		try {
			const state = getState()
			const authSig = selectAuthSig(state)
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

export function addSlot(item) {
	const newItem = { ...item }
	return async function(dispatch, getState) {
		try {
			const state = getState()
			const authSig = selectAuthSig(state)
			const { mainToken } = selectRelayerConfig()
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
					[mainToken.address]: parseUnits(
						newItem.temp.minPerImpression,
						mainToken.decimals
					)
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
			const { address } = account.identity
			const units = getAdUnits({ identity: address })
			const slots = getAdSlots({ identity: address })

			const [resUnits, resSlots] = await Promise.all([units, slots])

			updateItems({ items: resUnits, itemType: 'AdUnit' })(dispatch)
			updateItems({ items: resSlots, itemType: 'AdSlot' })(dispatch)
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

export function openCampaign({ campaign }) {
	return async function(dispatch, getState) {
		updateSpinner('opening-campaign', true)(dispatch)
		const account = selectAccount(getState())
		try {
			await getAllValidatorsAuthForIdentity({
				withBalance: [{ channel: campaign }],
				account,
			})

			const { readyCampaign } = await openChannel({
				campaign,
				account,
			})

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
				args: [getErrorMsg(err)],
			})
		}
		updateSpinner('opening-campaign', false)(dispatch)
		return true
	}
}

// Accepts the entire new item and replace so be careful!
export function updateItem({ item, itemType } = {}) {
	return async function(dispatch, getState) {
		updateSpinner('update' + item.id, true)(dispatch)
		try {
			const { account } = getState().persist
			const { authSig } = account.wallet
			const { mainToken } = selectRelayerConfig()

			let updatedItem = null
			let objModel = null

			const { id } = item

			switch (itemType) {
				case 'AdSlot':
					if (item.temp.minPerImpression) {
						item.minPerImpression = {
							[mainToken.address]: parseUnits(
								item.temp.minPerImpression,
								mainToken.decimals
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
				case 'Campaign':
					const campaign = new Campaign(item).marketUpdate
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
				args: [getErrorMsg(err)],
			})
		}
	}
}

// TEMP for testing in production until 4.1 is deployed
function getHumanFriendlyName(campaign) {
	if (campaign.status && campaign.status.humanFriendlyName === 'Closed')
		return 'Closed'
	switch ((campaign.status || {}).name) {
		case 'Active':
		case 'Ready':
		case 'Pending':
		case 'Initializing':
		case 'Waiting':
		case 'Offline':
		case 'Disconnected':
		case 'Unhealthy':
		case 'Invalid':
			return 'Active'
		case 'Expired':
		case 'Exhausted':
		case 'Withdraw':
			return 'Completed'
		default:
			return 'N/A'
	}
}

export function updateUserCampaigns(updateStats = true) {
	return async function(dispatch, getState) {
		const hasAuth = selectAuth(getState())
		const { wallet, identity } = selectAccount(getState())
		const { authSig } = wallet
		const { address } = identity
		const campaignsFromStore = selectCampaigns(getState())
		const campaignPromises = []
		if (hasAuth && authSig && address) {
			try {
				const campaigns = await getCampaigns({ authSig, creator: address })
				let campaignsMapped = campaigns
					.filter(
						c => c.creator && c.creator.toLowerCase() === address.toLowerCase()
					)
					.map(c => {
						if (updateStats) {
							const impressions = campaignAnalytics({
								campaign: c,
								eventType: 'IMPRESSION',
								metric: 'eventCounts',
								timeframe: 'year',
								limit: 200,
							})
							const clicks = campaignAnalytics({
								campaign: c,
								eventType: 'CLICK',
								metric: 'eventCounts',
								timeframe: 'year',
								limit: 200,
							})
							campaignPromises.push(impressions)
							campaignPromises.push(clicks)
						}

						const campaign = { ...c.spec, ...c }

						if (!campaign.humanFriendlyName) {
							campaign.status.humanFriendlyName = getHumanFriendlyName(campaign)
						}
						if (!updateStats) {
							//when not updating the stats keep the previous
							const { impressions, clicks } = campaignsFromStore[c.id] || {
								impressions: 0,
								clicks: 0,
							}
							campaign.impressions = impressions
							campaign.clicks = clicks
						}
						return campaign
					})
				if (updateStats) {
					campaignsMapped = await Promise.all(campaignPromises).then(function(
						results
					) {
						// replace promises with their resolved values
						let index = 0
						for (let i = 0; i < results.length; i += 2) {
							campaignsMapped[index].impressions = results[i].aggr.reduce(
								(a, b) => a + (Number(b.value) || 0),
								0
							)
							campaignsMapped[index].clicks = results[i + 1].aggr.reduce(
								(a, b) => a + (Number(b.value) || 0),
								0
							)
							++index
						}
						return campaignsMapped
					})
				}

				updateItems({
					items: campaignsMapped,
					itemType: 'Campaign',
				})(dispatch)
			} catch (err) {
				console.error('ERR_GETTING_CAMPAIGNS', err)

				addToast({
					dispatch,
					type: 'cancel',
					toastStr: 'ERR_GETTING_ITEMS',
					args: [getErrorMsg(err)],
				})
			}
		}
	}
}

export function closeCampaign({ campaign }) {
	return async function(dispatch, getState) {
		updateSpinner('closing-campaign', true)(dispatch)
		try {
			const state = getState()
			const authSig = selectAuthSig(state)
			const { account } = state.persist
			const { authTokens } = await closeChannel({ account, campaign })
			await closeCampaignMarket({ campaign, authSig })
			updateValidatorAuthTokens({ newAuth: authTokens })(dispatch, getState)
			execute(push('/dashboard/advertiser/campaigns'))
			addToast({
				dispatch,
				type: 'accept',
				toastStr: 'SUCCESS_CLOSING_CAMPAIGN',
				args: [campaign.id],
			})
			updateUserCampaigns(dispatch, getState)
		} catch (err) {
			console.error('ERR_CLOSING_CAMPAIGN', err)
			addToast({
				dispatch,
				type: 'cancel',
				toastStr: 'ERR_CLOSING_CAMPAIGN',
				args: [getErrorMsg(err)],
			})
		}
		updateSpinner('closing-campaign', false)(dispatch)
	}
}

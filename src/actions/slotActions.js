import {
	updateSpinner,
	handleAfterValidation,
	validateSchemaProp,
	validateNumberString,
	validateMediaSize,
	updateNewSlot,
	addToast,
	validate,
	getImgsIpfsFromBlob,
	updateNewItem,
} from 'actions'
import { numStringCPMtoImpression } from 'helpers/numbers'
import {
	selectMainToken,
	selectNewAdSlot,
	selectAuthSig,
	t,
	selectNewItemByTypeAndId,
	selectAdSlotById,
} from 'selectors'
import { schemas, AdSlot, AdUnit } from 'adex-models'
import {
	verifyWebsite,
	postAdUnit,
	postAdSlot,
	updateAdSlot,
} from 'services/adex-market/actions'
import { getWidAndHightFromType } from 'helpers/itemsHelpers'

import { ADD_ITEM, UPDATE_ITEM } from 'constants/actionTypes'
import Helper from 'helpers/miscHelpers'
import { ipfsSrc } from 'helpers/ipfsHelpers'
import { getImgObjectUrlFromExternalUrl } from 'services/images/blob'

const { adSlotPost, adUnitPost, adSlotPut } = schemas

async function getFallbackUnit({
	mediaMime,
	tempUrl,
	targetUrl,
	type,
	authSig,
	title,
	description,
}) {
	const imageIpfs = (await getImgsIpfsFromBlob({
		tempUrl,
		authSig,
	})).ipfs

	const unit = new AdUnit({
		type,
		mediaUrl: `ipfs://${imageIpfs}`,
		targetUrl,
		mediaMime,
		created: Date.now(),
		title,
		description,
		targeting: [],
		tags: [],
		passback: true,
	})

	const resUnit = await postAdUnit({
		unit: unit.marketAdd,
		authSig,
	})

	return resUnit
}

export function validateNewSlotBasics({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		let isValid = false
		try {
			const mainToken = selectMainToken()
			const state = getState()
			const slot = selectNewAdSlot(state)
			const {
				title,
				description,
				type,
				website,
				minPerImpression = null,
				temp,
			} = slot

			const validations = await Promise.all([
				validateSchemaProp({
					validateId,
					value: title,
					prop: 'title',
					schema: adSlotPost.title,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: description,
					prop: 'description',
					schema: adSlotPost.description,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: type,
					prop: 'type',
					schema: adSlotPost.type,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: website,
					prop: 'website',
					schema: adSlotPost.website,
					dirty,
				})(dispatch),
				validateNumberString({
					validateId,
					prop: 'minPerImpression',
					value: minPerImpression || '0',
					dirty,
				})(dispatch),
			])

			isValid = validations.every(v => v === true)

			if (isValid && minPerImpression) {
				isValid = await validateSchemaProp({
					validateId,
					value: {
						[mainToken.address]: numStringCPMtoImpression({
							numStr: minPerImpression || null,
							decimals: mainToken.decimals,
						}),
					},
					prop: 'minPerImpression',
					schema: adSlotPost.minPerImpression,
					dirty,
				})(dispatch)
			}

			const { hostname, issues } = isValid
				? await verifyWebsite({ websiteUrl: website })
				: {}
			const newTemp = { ...temp, hostname, issues }
			updateNewSlot('temp', newTemp)(dispatch, getState)
		} catch (err) {
			// NOTE: Just log - most probably the error can be from verifyWebsite
			// bet this doesn't matter at that point
			console.error('ERR_VALIDATING_SLOT_BASIC', err)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

export function validateNewSlotPassback({
	validateId,
	dirty,
	onValid,
	onInvalid,
	itemId,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)

		const state = getState()
		const {
			type,
			targetUrl,
			temp: { useFallback, tempUrl, mime },
		} = selectNewItemByTypeAndId(state, 'AdSlot', itemId)

		const { width, height } = getWidAndHightFromType(type)

		const validations = await Promise.all([
			...(useFallback
				? [
						validateMediaSize({
							validateId,
							dirty,
							propName: 'temp',
							widthTarget: width,
							heightTarget: height,
							msg: 'ERR_IMG_SIZE_EXACT',
							exact: true,
							required: true,
							media: {
								tempUrl,
								mime,
							},
						})(dispatch),
				  ]
				: [
						validate(validateId, 'temp', {
							isValid: true,
							dirty,
						})(dispatch),
				  ]),
			...(useFallback
				? [
						validateSchemaProp({
							validateId,
							value: targetUrl,
							prop: 'targetUrl',
							schema: adUnitPost.targetUrl,
							dirty,
						})(dispatch),
				  ]
				: [
						validate(validateId, 'targetUrl', {
							isValid: true,
							dirty,
						})(dispatch),
				  ]),
		])

		const isValid = validations.every(v => v === true)

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

export function saveSlot() {
	return async function(dispatch, getState) {
		try {
			const state = getState()
			const item = selectNewAdSlot(state)
			const newItem = { ...item }
			const authSig = selectAuthSig(state)
			const mainToken = selectMainToken()
			let fallbackUnit = null
			if (newItem.temp.useFallback) {
				fallbackUnit = (await getFallbackUnit({
					mediaMime: newItem.temp.mime,
					tempUrl: newItem.temp.tempUrl,
					targetUrl: newItem.targetUrl,
					type: newItem.type,
					authSig,
					title: newItem.title,
					description: newItem.description,
				})).ipfs
			}

			newItem.fallbackUnit = fallbackUnit
			newItem.created = Date.now()

			if (newItem.minPerImpression) {
				newItem.minPerImpression = {
					[mainToken.address]: numStringCPMtoImpression({
						numStr: newItem.minPerImpression,
						decimals: mainToken.decimals,
					}),
				}
			}

			const resItem = await postAdSlot({
				slot: new AdSlot(newItem).marketAdd,
				authSig,
			})

			dispatch({
				type: ADD_ITEM,
				item: new AdSlot(resItem).plainObj(),
				itemType: 'AdSlot',
			})

			addToast({
				type: 'accept',
				label: t('SUCCESS_CREATING_ITEM', { args: ['AdSlot', newItem.title] }),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_CREATING_ITEM', err)
			addToast({
				type: 'cancel',
				label: t('ERR_CREATING_ITEM', {
					args: ['AdSlot', Helper.getErrMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
			throw new Error('ERR_CREATING_ITEM', err)
		}
	}
}

export function mapCurrentToNewTargeting({ itemId, dirtyProps }) {
	return async function(dispatch, getState) {
		const state = getState()
		const item = selectAdSlotById(state, itemId)
		const { temp } = selectNewItemByTypeAndId(state, 'AdSlot', itemId)

		const targets = dirtyProps.includes('tags')
			? temp.targets
			: [...item.tags].map((tag, key) => ({
					key,
					collection: 'tags',
					source: 'custom',
					label: t(`TARGET_LABEL_TAGS`),
					placeholder: t(`TARGET_LABEL_TAGS`),
					target: { ...tag },
			  }))

		updateNewItem(
			item,
			{ temp: { ...temp, targets } },
			'AdSlot',
			AdSlot,
			item.id
		)(dispatch, getState)
	}
}

export function updateSlotTargeting({ updateField, itemId, onValid }) {
	return async function(dispatch, getState) {
		const state = getState()
		const { tags } = selectNewItemByTypeAndId(state, 'AdSlot', itemId)
		updateField('tags', tags)
		onValid()
	}
}

export function updateWebsiteVerification({ id, website }) {
	return async function(dispatch, getState) {
		const websiteUrl = website || 'https://' + id
		updateSpinner('vilifying' + websiteUrl, true)(dispatch)
		try {
			const { issues, updated, hostname } = await verifyWebsite({
				websiteUrl,
			})
			const item = { id: hostname, issues, updated }

			dispatch({
				type: UPDATE_ITEM,
				item,
				itemType: 'Website',
			})

			if (issues && issues.length) {
				addToast({
					type: 'warning',
					label: t('UPDATING_WS_VERIFICATION_WITH_ISSUES', {
						args: [websiteUrl],
					}),
					timeout: 20000,
				})(dispatch)
			} else {
				addToast({
					type: 'success',
					label: t('SUCCESS_UPDATING_WS_VERIFICATION', {
						args: [websiteUrl],
					}),
					args: [websiteUrl],
					timeout: 20000,
				})(dispatch)
			}
		} catch (err) {
			console.error('ERR_UPDATING_WS_VERIFICATION', err)
			addToast({
				type: 'error',

				label: t('ERR_UPDATING_WS_VERIFICATION', {
					args: [id, err],
				}),
				args: [id, err],
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner('vilifying' + websiteUrl, false)(dispatch)
	}
}

export function mapCurrentToNewPassback({ itemId, dirtyProps }) {
	return async function(dispatch, getState) {
		const state = getState()
		const item = selectAdSlotById(state, itemId)
		const newItem = selectNewItemByTypeAndId(state, 'AdSlot', itemId)

		const isDirty = ['mediaUrl', 'mediaMime', 'targetUrl'].some(prop =>
			dirtyProps.includes(prop)
		)

		const { mediaUrl, mediaMime, targetUrl } = item
		const newValues = {}
		if (isDirty) {
			newValues.temp = {
				...newItem.temp,
			}
			newValues.targetUrl = newItem.targetUrl
		} else {
			const tempUrl = mediaUrl
				? await getImgObjectUrlFromExternalUrl(ipfsSrc(mediaUrl))
				: mediaUrl

			newValues.temp = {
				...item.temp,
				tempUrl,
				mime: mediaMime,
				useFallback: !!(mediaUrl || mediaMime || targetUrl),
			}
			newValues.targetUrl = targetUrl
		}

		updateNewItem(item, newValues, 'AdSlot', AdSlot, item.id)(
			dispatch,
			getState
		)
	}
}

export function updateSlotPasback({
	updateMultipleFields,
	itemId,
	onValid: onValidProp,
	validateId,
}) {
	return async function(dispatch, getState) {
		const state = getState()
		const { temp, targetUrl } = selectNewItemByTypeAndId(
			state,
			'AdSlot',
			itemId
		)
		const { tempUrl, mime, useFallback } = temp

		const newValues = {
			targetUrl: useFallback ? targetUrl : '',
			mediaUrl: useFallback ? tempUrl : '',
			mediaMime: useFallback ? mime : '',
		}

		const onValid = () => {
			updateMultipleFields(newValues, [
				{
					name: 'passbackData',
					fields: ['targetUrl', 'mediaUrl', 'mediaMime'],
				},
			])
			onValidProp()
		}

		await validateNewSlotPassback({
			validateId,
			dirty: true,
			onValid,
			itemId,
		})(dispatch, getState)
	}
}

export function validateAndUpdateSlot({
	validateId,
	dirty,
	item,
	update,
	dirtyProps,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		try {
			const state = getState()
			const mainToken = selectMainToken()
			const {
				id,
				type,
				title,
				description,
				minPerImpression,
				website,
				mediaUrl,
				mediaMime,
				targetUrl,
			} = item

			const newSlot = new AdSlot(item)
			const checkMinPerImpression = typeof minPerImpression === 'string'

			const validations = await Promise.all([
				validateSchemaProp({
					validateId,
					value: title,
					prop: 'title',
					schema: adSlotPut.title,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: description,
					prop: 'description',
					schema: adSlotPut.description,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: website,
					prop: 'website',
					schema: adSlotPut.website,
					dirty,
				})(dispatch),
				checkMinPerImpression
					? validateNumberString({
							validateId,
							prop: 'minPerImpression',
							value: minPerImpression,
							dirty,
					  })(dispatch)
					: true,
			])

			let isValid = validations.every(v => v === true)

			if (isValid && checkMinPerImpression) {
				newSlot.minPerImpression = {
					[mainToken.address]: numStringCPMtoImpression({
						numStr: minPerImpression || null,
						decimals: mainToken.decimals,
					}),
				}
			}

			const isPassbackUpdated = ['mediaUrl', 'targetUrl'].some(prop =>
				dirtyProps.includes(prop)
			)

			const fallbackData = {
				mediaMime,
				mediaUrl,
				targetUrl,
			}

			let newUnit = null
			if (isPassbackUpdated && update) {
				if (mediaUrl && mediaMime && targetUrl) {
					const authSig = selectAuthSig(state)
					newUnit = await getFallbackUnit({
						mediaMime,
						tempUrl: mediaUrl,
						targetUrl,
						type,
						authSig,
						title,
						description,
					})

					newSlot.fallbackUnit = newUnit.ipfs
					fallbackData.mediaMime = newUnit.mediaMime
					fallbackData.mediaUrl = newUnit.mediaUrl
					fallbackData.targetUrl = newUnit.targetUrl
				} else {
					newSlot.fallbackUnit = null
					fallbackData.mediaMime = ''
					fallbackData.mediaUrl = ''
					fallbackData.targetUrl = ''
				}
			}

			const slot = newSlot.marketUpdate

			if (isValid) {
				const finalValidations = await Promise.all([
					validateSchemaProp({
						validateId,
						value: newSlot.minPerImpression,
						prop: 'minPerImpression',
						schema: adSlotPut.minPerImpression,
						dirty,
					})(dispatch),
					validateSchemaProp({
						validateId,
						value: slot,
						prop: 'slot',
						schema: adSlotPut,
						dirty,
					})(dispatch),
				])

				isValid = finalValidations.every(v => v === true)
			}

			if (isValid && update) {
				const updatedSlot = (await updateAdSlot({ slot, id })).slot

				if (dirtyProps.includes('website')) {
					await updateWebsiteVerification({ website })(dispatch)
				}

				if (newUnit) {
					dispatch({
						type: ADD_ITEM,
						item: new AdUnit(newUnit).plainObj(),
						itemType: 'AdUnit',
					})
				}

				dispatch({
					type: UPDATE_ITEM,
					item: new AdSlot({ ...updatedSlot, ...fallbackData }).plainObj(),
					itemType: 'AdSlot',
				})
			}
		} catch (err) {
			console.error('ERR_UPDATING_ITEM', err)
			addToast({
				type: 'cancel',
				label: t('ERR_UPDATING_ITEM', {
					args: ['AdSlot', Helper.getErrMsg(err)],
				}),
				timeout: 50000,
			})(dispatch)
		}

		await updateSpinner(validateId, false)(dispatch)
	}
}

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
} from 'actions'
import { numStringCPMtoImpression } from 'helpers/numbers'
import {
	selectMainToken,
	selectNewAdSlot,
	selectAuthSig,
	t,
	selectNewItemByTypeAndId,
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

const { adSlotPost, adUnitPost, adSlotPut } = schemas

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
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)

		const state = getState()
		const {
			type,
			targetUrl,
			temp: { useFallback, tempUrl, mime },
		} = selectNewAdSlot(state)

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
				timeout: 50000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_CREATING_ITEM', err)
			addToast({
				type: 'cancel',
				label: t('ERR_CREATING_ITEM', {
					args: ['AdSlot', Helper.getErrMsg(err)],
				}),
				timeout: 50000,
			})(dispatch)
			throw new Error('ERR_CREATING_ITEM', err)
		}
	}
}

export function updateSlotTargeting({ updateField, itemId }) {
	return async function(dispatch, getState) {
		const state = getState()
		const { tags } = selectNewItemByTypeAndId(state, 'AdSlot', itemId)
		updateField('tags', tags)
	}
}

export function validateAndUpdateSlot({ validateId, dirty, item, update }) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		try {
			const mainToken = selectMainToken()
			const { id, title, description, minPerImpression, website } = item

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
				const updatedSlot = (await updateAdSlot({ slot, id })).unit
				dispatch({
					type: UPDATE_ITEM,
					item: new AdSlot(updatedSlot).plainObj(),
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

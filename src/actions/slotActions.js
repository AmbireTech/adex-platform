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
	updateNewWebsite,
} from 'actions'
import { numStringCPMtoImpression } from 'helpers/numbers'
import { getErrorMsg } from 'helpers/errors'
import {
	selectMainToken,
	selectNewAdSlot,
	selectAuthSig,
	selectNewWebsite,
	t,
	selectNewItemByTypeAndId,
	selectAdSlotById,
	selectWebsiteByWebsite,
} from 'selectors'
import { schemas, AdSlot, AdUnit, helpers } from 'adex-models'
import {
	verifyWebsite,
	postAdUnit,
	postAdSlot,
	updateAdSlot,
} from 'services/adex-market/actions'
import { getWidAndHightFromType } from 'helpers/itemsHelpers'

import { ADD_ITEM, UPDATE_ITEM } from 'constants/actionTypes'
import { ipfsSrc } from 'helpers/ipfsHelpers'
import { getImgObjectUrlFromExternalUrl } from 'services/images/blob'
import { BigNumber, utils } from 'ethers'

const { adSlotPost, adUnitPost, adSlotPut } = schemas
const { slotRulesInputToTargetingRules } = helpers

const { VALIDATOR_FOLLOWER_FEE_NUM, VALIDATOR_FOLLOWER_FEE_DEN } = process.env

// in float - CPM
// NOTE:  `minPerImpression` is used as the value user sees and modifies
// `minPerImpression` is obsolete in the protocol but this way we can easily
// manage the user input w/o multiple conversion of the CPM value
function getRuleMinCPMWithValidatorFeeAdded(cpmInput) {
	const withFee =
		+cpmInput / (1 - +VALIDATOR_FOLLOWER_FEE_NUM / +VALIDATOR_FOLLOWER_FEE_DEN)
	return withFee.toString()
}

async function getFallbackUnit({
	mediaMime,
	tempUrl,
	targetUrl,
	type,
	authSig,
	title,
	description,
}) {
	const imageIpfs = (
		await getImgsIpfsFromBlob({
			tempUrl,
			authSig,
		})
	).ipfs

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
				rulesInput,
				temp,
			} = slot

			const { inputs = {} } = rulesInput || {}
			const { autoSetMinCPM } = inputs

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
			])

			isValid = validations.every(v => v === true)

			if (isValid && !autoSetMinCPM && minPerImpression !== null) {
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

			const { hostname, issues, categories, suggestedMinCPM } = isValid
				? await verifyWebsite({ websiteUrl: website })
				: {}
			const newTemp = { ...temp, hostname, issues, categories, suggestedMinCPM }

			const ruleCPM = !!autoSetMinCPM ? suggestedMinCPM : minPerImpression

			const rulesCPMWithValidatorFee = getRuleMinCPMWithValidatorFeeAdded(
				ruleCPM
			)

			const rules = slotRulesInputToTargetingRules({
				rulesInput,
				suggestedMinCPM: rulesCPMWithValidatorFee,
				decimals: mainToken.decimals,
			})

			updateNewSlot('temp', newTemp)(dispatch, getState)
			updateNewSlot('rules', rules)(dispatch, getState)
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
				fallbackUnit = (
					await getFallbackUnit({
						mediaMime: newItem.temp.mime,
						tempUrl: newItem.temp.tempUrl,
						targetUrl: newItem.targetUrl,
						type: newItem.type,
						authSig,
						title: newItem.title,
						description: newItem.description,
					})
				).ipfs
			}

			newItem.fallbackUnit = fallbackUnit
			newItem.created = Date.now()

			const minPerImpression = newItem.rulesInput.inputs.autoSetMinCPM
				? newItem.temp.suggestedMinCPM
				: newItem.minPerImpression

			if (minPerImpression) {
				newItem.minPerImpression = {
					[mainToken.address]: numStringCPMtoImpression({
						numStr: minPerImpression,
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
				label: t('SUCCESS_CREATING_ITEM', { args: ['ADSLOT', newItem.title] }),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_CREATING_ITEM', err)
			addToast({
				type: 'cancel',
				label: t('ERR_CREATING_ITEM', {
					args: ['ADSLOT', getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
			throw new Error('ERR_CREATING_ITEM', err)
		}
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

		updateNewItem(
			item,
			newValues,
			'AdSlot',
			AdSlot,
			item.id
		)(dispatch, getState)
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
	onUpdateSuccess,
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
				rulesInput: slotRulesInput,
			} = item

			// Because of old slot and default value null
			const rulesInput = slotRulesInput || { version: '1', inputs: {} }

			const { autoSetMinCPM } = rulesInput.inputs

			const newSlot = new AdSlot(item)
			const updateMinPerImpression =
				typeof minPerImpression === 'string' && !autoSetMinCPM

			const updateRules = dirtyProps.some(
				prop =>
					prop &&
					(prop.name === 'rulesInput' ||
						(prop.fields || []).includes('rulesInput'))
			)

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
				updateMinPerImpression
					? validateNumberString({
							validateId,
							prop: 'minPerImpression',
							value: minPerImpression,
							dirty,
					  })(dispatch)
					: true,
				updateRules
					? validateSchemaProp({
							validateId,
							prop: 'rulesInput',
							value: rulesInput,
							schema: adSlotPut.rulesInput,
							dirty,
					  })(dispatch)
					: true,
			])

			let isValid = validations.every(v => v === true)

			let minCPM = null
			let newRules = null
			let rulesCPM = null

			if (isValid && !autoSetMinCPM && updateMinPerImpression) {
				if (!minPerImpression || parseFloat(minPerImpression) <= 0) {
					throw new Error('INVALID_MANUAL_MIN_CPM_VALUE')
				}

				rulesCPM = minPerImpression
			} else if (isValid && autoSetMinCPM) {
				rulesCPM = (await verifyWebsite({ websiteUrl: website }))
					.suggestedMinCPM

				if (!rulesCPM) {
					throw new Error('INVALID_AUTO_CPM_VALUE')
				}
			} else if (isValid) {
				rulesCPM =
					!!minPerImpression && typeof minPerImpression === 'object'
						? utils.formatUnits(
								BigNumber.from(Object.values(minPerImpression)[0]).mul(1000),
								mainToken.decimals
						  )
						: minPerImpression
			}

			if (isValid && (updateMinPerImpression || updateRules)) {
				newRules = slotRulesInputToTargetingRules({
					rulesInput,
					suggestedMinCPM: getRuleMinCPMWithValidatorFeeAdded(rulesCPM),
					decimals: mainToken.decimals,
				})

				minCPM = {
					[mainToken.address]: numStringCPMtoImpression({
						numStr: rulesCPM || null,
						decimals: mainToken.decimals,
					}),
				}

				newSlot.minPerImpression = minCPM
				newSlot.rules = newRules
			}

			const isPassbackUpdated = dirtyProps.some(
				prop => prop && prop.name === 'passbackData'
			)

			const fallbackData = {
				mediaMime,
				mediaUrl,
				targetUrl,
			}

			let newUnit = null
			if (isValid && isPassbackUpdated && update) {
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
						value: newSlot.rules,
						prop: 'rules',
						schema: adSlotPut.rules,
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
				addToast({
					type: 'success',
					label: t('SUCCESS_UPDATING_ITEM', {
						args: ['ADSLOT', updatedSlot.title],
					}),
					timeout: 50000,
				})(dispatch)
				onUpdateSuccess && onUpdateSuccess()
			} else if (!isValid && update) {
				addToast({
					type: 'error',
					label: t('ERR_UPDATING_ITEM', {
						args: ['ADSLOT', getErrorMsg('INVALID_DATA')],
					}),
					timeout: 50000,
				})(dispatch)
			}
		} catch (err) {
			console.error('ERR_UPDATING_ITEM', err)
			addToast({
				type: 'error',
				label: t('ERR_UPDATING_ITEM', {
					args: ['ADSLOT', getErrorMsg(err)],
				}),
				timeout: 50000,
			})(dispatch)
		}

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function validateAndSaveNewWebsiteBasics({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		let isValid = false
		try {
			const state = getState()
			const slot = selectNewWebsite(state)
			const { website, temp } = slot

			isValid = await validateSchemaProp({
				validateId,
				value: website,
				prop: 'website',
				schema: adSlotPost.website,
				dirty,
			})(dispatch)

			if (isValid) {
				isValid = !Object.keys(selectWebsiteByWebsite(state, website)).length

				await validate(validateId, 'website', {
					isValid,
					err: { msg: 'ERR_WEBSITE_EXISTS' },
					dirty,
				})(dispatch)
			}

			if (isValid && dirty) {
				const {
					hostname,
					issues,
					categories,
					suggestedMinCPM,
					updated,
				} = isValid ? await verifyWebsite({ websiteUrl: website }) : {}
				const newTemp = {
					...temp,
					hostname,
					issues,
					categories,
					suggestedMinCPM,
				}

				const newWebsite = {
					id: hostname,
					issues,
					updated,
				}

				dispatch({
					type: ADD_ITEM,
					item: newWebsite,
					itemType: 'Website',
				})

				updateNewWebsite('temp', newTemp)(dispatch, getState)

				addToast({
					type: 'accept',
					label: t('SUCCESS_CREATING_ITEM', {
						args: ['WEBSITE', hostname],
					}),
					timeout: 20000,
				})(dispatch)
			}
		} catch (err) {
			// NOTE: Just log - most probably the error can be from verifyWebsite
			// bet this doesn't matter at that point
			console.error('ERR_VALIDATING_WEBSITE_BASIC', err)
			isValid = false
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

import {
	updateSpinner,
	handleAfterValidation,
	validateSchemaProp,
	validateMediaSize,
	addToast,
	getImgsIpfsFromBlob,
} from 'actions'
import { selectNewAdUnit, selectAuthSig, t } from 'selectors'
import { schemas, AdUnit } from 'adex-models'
import { getWidAndHightFromType } from 'helpers/itemsHelpers'

import { ADD_ITEM } from 'constants/actionTypes'
import Helper from 'helpers/miscHelpers'

import { postAdUnit } from 'services/adex-market/actions'

const { adUnitPost } = schemas

export function validateNewUnitBasics({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		try {
			const state = getState()
			const { title, description, type, targetUrl } = selectNewAdUnit(state)

			const validations = await Promise.all([
				validateSchemaProp({
					validateId,
					value: title,
					prop: 'title',
					schema: adUnitPost.title,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: description,
					prop: 'description',
					schema: adUnitPost.description,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: type,
					prop: 'type',
					schema: adUnitPost.type,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: targetUrl,
					prop: 'targetUrl',
					schema: adUnitPost.targetUrl,
					dirty,
				})(dispatch),
			])

			let isValid = validations.every(v => v === true)

			await handleAfterValidation({ isValid, onValid, onInvalid })
		} catch (err) {}

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function validateNewUnitMedia({
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
			temp: { tempUrl, mime },
		} = selectNewAdUnit(state)

		const { width, height } = getWidAndHightFromType(type)

		const validations = await Promise.all([
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
		])

		const isValid = validations.every(v => v === true)

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

export function saveUnit() {
	return async function(dispatch, getState) {
		try {
			const state = getState()
			const item = selectNewAdUnit(state)
			const newItem = { ...item }
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
				type: ADD_ITEM,
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
				type: 'cancel',
				label: t('ERR_CREATING_ITEM', {
					args: ['AdUnit', Helper.getErrMsg(err)],
				}),
				timeout: 50000,
			})(dispatch)
			throw new Error('ERR_CREATING_ITEM', err)
		}
	}
}

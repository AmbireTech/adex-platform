import { ADD_ITEM, UPDATE_ITEM } from 'constants/actionTypes'
import { addToast, updateSpinner } from 'actions'
import { postAudience, putAudience } from 'services/adex-market/actions'

import { getErrorMsg } from 'helpers/errors'
import {
	t,
	selectNewAudience,
	selectNewItemByTypeAndId,
	selectAudienceById,
} from 'selectors'
import {
	validateSchemaProp,
	handleAfterValidation,
	validateAudience,
	updateNewItem,
} from 'actions'
import { Audience, schemas } from 'adex-models'

const { audiencePost, audiencePut } = schemas

export function updateAudienceInput({
	updateField,
	itemId,
	onValid,
	validateId,
}) {
	return async function(dispatch, getState) {
		const state = getState()
		const { inputs } = selectNewItemByTypeAndId(state, 'Audience', itemId)

		const isValid = await validateAudience({
			validateId,
			inputs,
			dirty: true,
			propName: 'inputs',
		})(dispatch)

		if (isValid) {
			await updateField('inputs', inputs)
			onValid()
		}
	}
}

export function validateAndUpdateAudience({
	validateId,
	dirty,
	item,
	update,
	onUpdateSuccess,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		try {
			const { id, title, version, inputs } = item

			const audience = new Audience(item).marketUpdate

			const validations = await Promise.all([
				validateSchemaProp({
					validateId,
					value: title,
					prop: 'title',
					schema: audiencePut.title,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: version,
					prop: 'version',
					schema: audiencePut.version,
					dirty,
				})(dispatch),
				validateAudience({
					validateId,
					inputs,
					dirty,
					propName: 'inputs',
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: audience,
					prop: 'audience',
					schema: audiencePut,
					dirty,
				})(dispatch),
			])

			const isValid = validations.every(v => v === true)

			if (isValid && update) {
				const updatedAudience = (await putAudience({
					audience,
					id,
				})).audience

				dispatch({
					type: UPDATE_ITEM,
					item: new Audience(updatedAudience).plainObj(),
					itemType: 'Audience',
				})
				addToast({
					type: 'success',
					label: t('SUCCESS_UPDATING_ITEM', {
						args: ['AUDIENCE', updatedAudience.title],
					}),
					timeout: 50000,
				})(dispatch)
			} else if (!isValid && update) {
				addToast({
					type: 'error',
					label: t('ERR_UPDATING_ITEM', {
						args: ['AUDIENCE', getErrorMsg('INVALID_DATA')],
					}),
					timeout: 50000,
				})(dispatch)
			}
			update && onUpdateSuccess && onUpdateSuccess()
		} catch (err) {
			console.error('ERR_UPDATING_ITEM', err)
			addToast({
				type: 'error',
				label: t('ERR_UPDATING_ITEM', {
					args: ['AUDIENCE', getErrorMsg(err)],
				}),
				timeout: 50000,
			})(dispatch)
		}

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function mapCurrentToNewAudience({ itemId, dirtyProps }) {
	return async function(dispatch, getState) {
		const state = getState()
		const item = selectAudienceById(state, itemId)
		const audience = selectNewItemByTypeAndId(state, 'Audience', itemId)

		const inputs = dirtyProps.includes('inputs') ? audience.inputs : item.inputs

		updateNewItem(
			item,
			{ inputs: { ...inputs } },
			'Audience',
			Audience,
			item.id
		)(dispatch, getState)
	}
}

export function saveAudience({ audienceInput, campaignId } = {}) {
	return async function(dispatch, getState) {
		try {
			const state = getState()
			const newAudience = { ...(audienceInput || selectNewAudience(state)) }
			newAudience.campaignId = campaignId || null
			if (campaignId) {
				newAudience.title = null
			}

			const audience = new Audience({
				...newAudience,
			}).marketAdd

			const resItem = await postAudience({
				audience,
			})

			dispatch({
				type: ADD_ITEM,
				item: resItem,
				itemType: 'Audience',
			})
			addToast({
				type: 'success',
				label: t('AUDIENCE_SAVED', {
					args: [newAudience.title || campaignId],
				}),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_CREATING_AUDIENCE', err)
			addToast({
				type: 'error',
				label: t('ERR_CREATING_AUDIENCE', {
					args: ['AUDIENCE', getErrorMsg(err)],
				}),
				timeout: 50000,
			})(dispatch)
			throw new Error('ERR_CREATING_ITEM', err)
		}
	}
}

export function validateAudienceBasics({
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
			const audience = selectNewAudience(state)
			const { title, inputs, version } = audience

			const validations = await Promise.all([
				validateSchemaProp({
					validateId,
					value: title,
					prop: 'title',
					schema: audiencePost.title,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: version,
					prop: 'version',
					schema: audiencePost.version,
					dirty,
				})(dispatch),
			])

			isValid = validations.every(v => v === true)
		} catch (err) {
			console.error('ERR_VALIDATING_SLOT_BASIC', err)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

export function validateAudienceInput({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		try {
			const state = getState()
			const { inputs = {} } = selectNewAudience(state)

			const isValid = await validateAudience({
				validateId,
				inputs,
				dirty,
				propName: 'inputs',
			})(dispatch)

			await handleAfterValidation({ isValid, onValid, onInvalid })
		} catch (err) {
			console.log('err', err)
		}

		await updateSpinner(validateId, false)(dispatch)
	}
}

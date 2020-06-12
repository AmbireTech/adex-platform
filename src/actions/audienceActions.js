import { ADD_ITEM } from 'constants/actionTypes'
import { addToast, updateSpinner } from 'actions'
import { postAudience } from 'services/adex-market/actions'

import { getErrorMsg } from 'helpers/errors'
import { t, selectNewAudience } from 'selectors'
import {
	// validateSchemaProp,
	handleAfterValidation,
} from 'actions'
// import { schemas } from 'adex-models'

// TODO:
// const { audiencePost, audiencePu } = schemas

export function saveAudience({ campaignId, audienceInput }) {
	return async function(dispatch, getState) {
		try {
			const resItem = await postAudience({
				campaignId,
				audienceInput,
			})

			dispatch({
				type: ADD_ITEM,
				item: resItem,
				itemType: 'Audience',
			})
		} catch (err) {
			console.error('ERR_CREATING_AUDIENCE', err)
			addToast({
				type: 'cancel',
				label: t('ERR_CREATING_AUDIENCE', {
					args: ['AdUnit', getErrorMsg(err)],
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
		// TODO:
		let isValid = true
		try {
			const state = getState()
			const audience = selectNewAudience(state)
			const { title, inputs, version } = audience

			// TODO:
			// const validations = await Promise.all([
			// 	validateSchemaProp({
			// 		validateId,
			// 		value: title,
			// 		prop: 'title',
			// 		schema: audiencePost.title,
			// 		dirty,
			// 	})(dispatch),
			// 	validateSchemaProp({
			// 		validateId,
			// 		value: inputs,
			// 		prop: 'inputs',
			// 		schema: audiencePost.description,
			// 		dirty,
			// 	})(dispatch),
			// ])

			// isValid = validations.every(v => v === true)
		} catch (err) {
			console.error('ERR_VALIDATING_SLOT_BASIC', err)
		}

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

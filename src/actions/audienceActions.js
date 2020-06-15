import { ADD_ITEM } from 'constants/actionTypes'
import { addToast, updateSpinner } from 'actions'
import { postAudience } from 'services/adex-market/actions'

import { getErrorMsg } from 'helpers/errors'
import { t, selectNewAudience } from 'selectors'
import {
	validateSchemaProp,
	handleAfterValidation,
	validateAudience,
} from 'actions'
import { Audience, schemas } from 'adex-models'

// TODO:
const { audiencePost, audiencePut } = schemas

export function saveAudience() {
	return async function(dispatch, getState) {
		try {
			const state = getState()
			const newAudience = selectNewAudience(state)

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
					value: inputs,
					prop: 'inputs',
					schema: audiencePost.inputs,
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

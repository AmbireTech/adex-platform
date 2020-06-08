import { ADD_ITEM } from 'constants/actionTypes'
import { addToast } from 'actions'
import { postAudience } from 'services/adex-market/actions'

import { getErrorMsg } from 'helpers/errors'
import { t } from 'selectors'

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

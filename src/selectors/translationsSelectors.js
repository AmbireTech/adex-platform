import { createSelector } from 'reselect'
import { getState } from 'actions'
import { translate } from 'services/translations/translations'

const selectLang = state => state.persist.language

export const selectTranslations = createSelector(
	[
		selectLang,
		(_, val, opts = {}) => {
			return { val, opts }
		},
	],
	(lang, { val, opts }) => {
		const { isProp = false, args = [''] } = opts
		return translate(val, { isProp, args }, lang)
	}
)

export const t = (val, opts) => selectTranslations(getState(), val, opts)

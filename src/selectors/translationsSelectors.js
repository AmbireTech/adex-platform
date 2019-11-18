import { createSelector } from 'reselect'
import { getState } from 'actions'
import { translate } from 'services/translations/translations'

export const selectLang = state => state.persist.language

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

// Need to useSelector for language in top component where this will be used
// Now this is don by using Translate Hoc on Root
// It will work in actions too as the state isg get when they are called and don't need update
export const t = (val, opts) => selectTranslations(getState(), val, opts)

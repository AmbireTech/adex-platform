import { t } from 'selectors'
import { createSelector } from 'reselect'
import { WHERE_YOU_KNOW_US, USER_SIDES } from 'constants/misc'
export const selectFromSource = createSelector(
	labelValueMapping => labelValueMapping,
	source =>
		source.map(data => {
			const translated = { ...data }
			translated.label = t(data.label)
			const extraLabel = data.extraLabel
				? t(data.extraLabel)
				: data.extraLabels && data.extraLabels.length
				? data.extraLabels.map(l => t(l))
				: undefined
			translated.extraLabel = extraLabel
			return translated
		})
)

export const selectKnowUsFromSource = createSelector(
	() => selectFromSource(WHERE_YOU_KNOW_US),
	source => source
)

export const selectUserSides = createSelector(
	() => selectFromSource(USER_SIDES),
	source => source
)

import { createSelector } from 'reselect'
import { selectAdUnitsArray } from 'selectors'

export const selectHasCreatedAdUnit = createSelector(
	[selectAdUnitsArray],
	adUnitsArray => adUnitsArray.length > 0
)

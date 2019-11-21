import { createSelector } from 'reselect'

export const selectNavTitle = state => state.memory.nav.navTitle
export const selectSide = state => state.memory.nav.side

export const selectSpinners = state => state.memory.spinners

export const selectSpinnerById = createSelector(
	[selectSpinners, (_, id) => id],
	(spinners, id) => spinners[id]
)

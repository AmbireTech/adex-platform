import { createSelector } from 'reselect'

const REGISTRATION_OPEN = process.env.REGISTRATION_OPEN === 'true'

export const selectNavTitle = state => state.memory.nav.navTitle
export const selectSide = state => state.memory.nav.side
export const selectUi = state => state.persist.ui

export const selectSpinners = state => state.memory.spinners

export const selectSpinnerById = createSelector(
	[selectSpinners, (_, id) => id],
	(spinners, id) => spinners[id]
)

export const selectMultipleSpinnersByIds = createSelector(
	[selectSpinners, (_, ids) => ids],
	(spinners, ids) => ids.map(id => spinners[id])
)

export const selectRegistrationAllowed = createSelector(
	selectUi,
	({ allowRegistration }) => REGISTRATION_OPEN || !!allowRegistration
)

export const selectEasterEggsAllowed = createSelector(
	selectUi,
	({ allowEasterEggs }) => allowEasterEggs
)

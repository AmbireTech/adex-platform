import { createSelector } from 'reselect'
import { selectAccountIdentityAddr } from './accountSelectors'

const REGISTRATION_OPEN = process.env.REGISTRATION_OPEN === 'true'

export const selectNavTitle = state => state.memory.nav.navTitle
export const selectSide = state => state.memory.nav.side
export const selectGlobalUi = state => state.persist.ui.global
export const selectIdentitiesUi = state => state.persist.ui.byIdentity
export const selectSelectedCampaigns = state =>
	state.memory.selectedItems.campaigns
export const selectSpinners = state => state.memory.spinners

export const selectIdentityUi = createSelector(
	[selectAccountIdentityAddr, selectIdentitiesUi],
	(identityAddr, identitiesUi) => identitiesUi[identityAddr] || {}
)

export const selectCompanyData = createSelector(
	[selectIdentityUi],
	({ companyData }) => companyData || {}
)

export const selectSpinnerById = createSelector(
	[selectSpinners, (_, id) => id],
	(spinners, id) => spinners[id]
)

export const selectMultipleSpinnersByIds = createSelector(
	[selectSpinners, (_, ids) => ids],
	(spinners, ids) => ids.map(id => spinners[id])
)

export const selectRegistrationAllowed = createSelector(
	selectGlobalUi,
	({ allowRegistration }) => REGISTRATION_OPEN || !!allowRegistration
)

export const selectEasterEggsAllowed = createSelector(
	selectGlobalUi,
	({ allowEasterEggs }) => allowEasterEggs
)

export const selectPrivilegesWarningAccepted = createSelector(
	selectGlobalUi,
	({ privilegesWarningAccepted }) => !!privilegesWarningAccepted
)

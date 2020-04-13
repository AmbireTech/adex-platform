import { createSelector } from 'reselect'
import { selectAccountIdentityAddr } from './accountSelectors'

const REGISTRATION_OPEN = process.env.REGISTRATION_OPEN === 'true'

export const selectNavTitle = state => state.memory.nav.navTitle
export const selectSide = state => state.memory.nav.side
export const selectGlobalUi = state => state.persist.ui.global
export const selectIdentitiesUi = state => state.persist.ui.byIdentity
export const selectSelectedItems = state => state.memory.selectedItems
export const selectConfirm = state => state.memory.confirm

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
	selectIdentityUi,
	({ privilegesWarningAccepted }) => !!privilegesWarningAccepted
)

export const selectSideSpecificUI = createSelector(
	[selectIdentityUi, selectSide],
	(ui, side) => ui[side] || {}
)

export const selectSafariWarningConfirmation = createSelector(
	[selectIdentityUi],
	({ safariWarningConfirmed }) => safariWarningConfirmed
)

export const selectHideGettingStarted = createSelector(
	[selectSideSpecificUI],
	({ hideGettingStarted }) => hideGettingStarted
)

export const selectGettingStartedExpanded = createSelector(
	selectIdentityUi,
	({ gettingStartedExpanded }) =>
		// NOTE: default is open but cant set initial state
		gettingStartedExpanded === undefined ? true : !!gettingStartedExpanded
)

export const selectSelectedCampaigns = createSelector(
	selectSelectedItems,
	({ campaigns }) => campaigns || []
)

export const selectLoginDirectSide = createSelector(
	selectGlobalUi,
	({ goToSide }) => goToSide || ''
)

import { createSelector } from 'reselect'
import { createCachedSelector } from 're-reselect'
import dateUtils from 'helpers/dateUtils'
import { selectAccountIdentityAddr } from './accountSelectors'
import { SYNC_WEB3_DATA } from 'constants/spinners'

const REGISTRATION_OPEN = process.env.REGISTRATION_OPEN === 'true'

export const selectNavTitle = state => state.memory.nav.navTitle
export const selectSide = state => state.memory.nav.side
export const selectMemoryUi = state => state.memory.uiMemory
export const selectGlobalUi = state => state.persist.ui.global
export const selectIdentitiesUi = state => state.persist.ui.byIdentity
export const selectSelectedItems = state => state.memory.selectedItems
export const selectConfirm = state => state.memory.confirm
export const selectToasts = state => state.memory.toasts
export const selectTablesState = state => state.persist.tablesState

export const selectSpinners = state => state.memory.spinners

export const selectIdentityUi = createSelector(
	[selectAccountIdentityAddr, selectIdentitiesUi],
	(identityAddr, identitiesUi) => identitiesUi[identityAddr] || {}
)

export const selectIdentitySideUi = createSelector(
	[selectIdentityUi, selectSide],
	(identityUi, side) => identityUi[side] || {}
)

export const selectCompanyData = createSelector(
	[selectIdentityUi],
	({ companyData }) => companyData || {}
)

export const selectUserLastSide = createSelector(
	[selectIdentityUi],
	({ userLastSide }) => userLastSide || ''
)

export const selectSpinnerById = createCachedSelector(
	selectSpinners,
	(_, id) => id,
	(spinners, id) => spinners[id]
)((_state, id) => id)

export const selectWeb3SyncSpinnerByValidateId = createCachedSelector(
	selectSpinners,
	(_, validateId) => validateId,
	(spinners, validateId) => spinners[SYNC_WEB3_DATA + validateId]
)((_state, validateId) => validateId)

export const selectMultipleSpinnersByIds = createCachedSelector(
	selectSpinners,
	(_, ids) => ids,
	(spinners, ids) => ids.map(id => spinners[id])
)((_state, ids) => ids.join(':'))

export const selectRegistrationAllowed = createSelector(
	selectGlobalUi,
	({ allowRegistration }) => REGISTRATION_OPEN || !!allowRegistration
)

export const selectEasterEggsAllowed = createSelector(
	selectGlobalUi,
	({ allowEasterEggs }) => allowEasterEggs
)

export const selectNewVersionAvailable = createSelector(
	selectGlobalUi,
	({ newVersionAvailable }) => newVersionAvailable
)

export const selectNewVersionAvailableId = createSelector(
	selectGlobalUi,
	({ selectNewVersionAvailableId }) => selectNewVersionAvailableId
)

export const selectPrivilegesWarningAccepted = createSelector(
	selectIdentityUi,
	({ privilegesWarningAccepted }) => !!privilegesWarningAccepted
)

export const selectSideSpecificUI = createSelector(
	[selectIdentityUi, selectSide],
	(ui, side) => ui[side] || {}
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

export const selectInitialDataLoadedByData = createCachedSelector(
	selectMemoryUi,
	(_, dataType) => dataType,
	({ initialDataLoaded }, dataType) =>
		initialDataLoaded === true ||
		(typeof initialDataLoaded === 'object' && initialDataLoaded[dataType])
)((_state, dataType) => dataType)

export const selectInitialDataLoaded = createSelector(
	selectMemoryUi,
	({ initialDataLoaded = false }) =>
		initialDataLoaded === true ||
		(typeof initialDataLoaded === 'object' &&
			[
				'accountIdentityData',
				'allItems',
				'stats',
				'campaigns',
				'advancedAnalytics',
			].every(type => !!initialDataLoaded[type]))
)

export const selectCampaignIdInDetails = createSelector(
	selectMemoryUi,
	({ campaignId }) => campaignId
)

export const selectLoginSelectedIdentity = createSelector(
	selectMemoryUi,
	({ loginSelectedIdentity }) => loginSelectedIdentity
)

export const selectAnalyticsDataSide = createSelector(
	[selectSide, selectCampaignIdInDetails],
	(side, campaignId) => (campaignId ? campaignId : side ? `for-${side}` : '')
)

export const selectIdentitySideAnalyticsTimeframe = createSelector(
	[selectIdentitySideUi],
	({ sideAnalyticsTimeframe = 'day' } = {}) => sideAnalyticsTimeframe
)

export const selectIdentitySideAnalyticsPeriod = createSelector(
	[selectIdentitySideUi],
	({
		sideAnalyticsPeriod = {
			start: dateUtils.startOfDay(dateUtils.date()),
			end: dateUtils.endOfDay(dateUtils.date()),
		},
	} = {}) => sideAnalyticsPeriod
)

export const selectWindowReloading = createSelector(
	selectMemoryUi,
	({ windowReloading }) => windowReloading
)

export const selectTableState = createCachedSelector(
	selectTablesState,
	selectAccountIdentityAddr,
	(_state, tableId) => tableId,
	(tablesStates, identityId, tableId) =>
		((tablesStates || {})[identityId] || {})[tableId] || {}
)((_state, tableId) => tableId)

//memory
export const selectTableStateSelectedRows = createCachedSelector(
	selectMemoryUi,
	(_state, tableId) => tableId,
	(memoryUI, tableId) => memoryUI[`selectedRows${tableId}`]
)((_state, tableId) => tableId)

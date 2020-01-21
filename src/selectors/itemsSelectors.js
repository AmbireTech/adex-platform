import { createSelector } from 'reselect'

export const selectItems = state => state.persist.items

export const selectCampaigns = createSelector(
	selectItems,
	({ Campaign }) => Campaign
)

export const selectUnits = createSelector(
	selectItems,
	({ AdUnit }) => AdUnit
)
export const selectSlots = createSelector(
	selectItems,
	({ AdSlot }) => AdSlot
)

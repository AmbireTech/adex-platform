import { createSelector } from 'reselect'

export const selectItems = state => state.persist.items

export const selectItemsByType = createSelector(
	[selectItems, (_, itemType) => itemType],
	(items, itemType) => items[itemType] || {}
)

export const selectItemsArrayByType = createSelector(
	[selectItemsByType, (_, itemType) => itemType],
	items => Object.values(items)
)

export const selectCampaigns = createSelector(
	state => selectItemsByType(state, 'Campaign'),
	campaigns => campaigns
)

export const selectCampaignsArray = createSelector(
	state => selectItemsArrayByType(state, 'Campaign'),
	campaigns => campaigns
)

export const selectAdUnits = createSelector(
	state => selectItemsByType(state, 'AdUnit'),
	adUnits => adUnits
)

export const selectAdUnitById = createSelector(
	[selectAdUnits, (_, id) => id],
	(items, id) => items[id]
)

export const selectAdUnitsArray = createSelector(
	state => selectItemsArrayByType(state, 'AdUnit'),
	adUnits => adUnits
)

export const selectAdSlots = createSelector(
	state => selectItemsByType(state, 'AdSot'),
	AdSots => AdSots
)

export const selectAdSlotsArray = createSelector(
	state => selectItemsArrayByType(state, 'AdSot'),
	adUnits => adUnits
)

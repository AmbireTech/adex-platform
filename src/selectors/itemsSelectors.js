import { createSelector } from 'reselect'
import { selectCampaignEventsCount } from 'selectors'
export const selectItems = state => state.persist.items

export const selectItemsByType = createSelector(
	[selectItems, (_, itemType) => itemType],
	(items, itemType) => items[itemType] || {}
)

export const selectItemsArrayByType = createSelector(
	[selectItemsByType, (_, itemType) => itemType],
	(items = {}) => Object.values(items)
)

export const selectCampaigns = createSelector(
	state => selectItemsByType(state, 'Campaign'),
	campaigns => campaigns
)

export const selectCampaignById = createSelector(
	[selectCampaigns, (_, id) => id],
	(campaigns, id) => campaigns[id]
)

export const selectCampaignUnitsById = createSelector(
	[selectCampaignById, (_, id) => id],
	({ adUnits } = {}) => adUnits || []
)

export const selectCampaignWithAnalyticsById = createSelector(
	[selectCampaigns, (_, id) => id],
	(campaigns, id) => {
		const campaign = { ...(campaigns[id] || {}) }
		campaign.clicks = selectCampaignEventsCount('CLICK', id)
		campaign.impressions = selectCampaignEventsCount('IMPRESSION', id)
		return campaign
	}
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
	state => selectItemsByType(state, 'AdSlot'),
	adSlots => adSlots
)

export const selectAdSlotsArray = createSelector(
	state => selectItemsArrayByType(state, 'AdSlot'),
	adSlots => adSlots
)

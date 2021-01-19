import { createSelector } from 'reselect'
import { createCachedSelector } from 're-reselect'

import { selectCampaignEventsCount, selectCampaignIdInDetails } from 'selectors'
import url from 'url'
export const selectItems = state => state.persist.items

export const selectItemsByType = createCachedSelector(
	selectItems,
	(_state, itemType) => itemType,
	(items, itemType) => items[itemType] || {}
)((_state, itemType) => itemType)

export const selectItemsArrayByType = createCachedSelector(
	selectItemsByType,
	items => Object.values(items || {})
)((_state, itemType) => itemType)

export const selectItemByTypeAndId = createCachedSelector(
	selectItemsByType,
	(_state, _itemType, id) => id,
	(items, id) => items[id] || {}
)((_state, _itemType, id) => id) // all items has unique id so they are good for cache

export const selectCampaigns = state => selectItemsByType(state, 'Campaign')
export const selectCampaignsArray = state =>
	selectItemsArrayByType(state, 'Campaign')

export const selectCampaignById = (state, id) =>
	selectItemByTypeAndId(state, 'Campaign', id)

export const selectCampaignUnitsById = createSelector(
	selectCampaignById,
	({ adUnits } = {}) => adUnits || []
)

export const selectCampaignInDetails = createSelector(
	[selectCampaignIdInDetails, state => state],
	(campaignId, state) =>
		campaignId ? selectCampaignById(state, campaignId) : undefined
)

export const selectCampaignWithAnalyticsById = createCachedSelector(
	selectCampaigns,
	(_, id) => id,
	(campaigns, id) => {
		const campaign = { ...(campaigns[id] || {}) }
		campaign.clicks = selectCampaignEventsCount('CLICK', id)
		campaign.impressions = selectCampaignEventsCount('IMPRESSION', id)
		return campaign
	}
)((_state, id) => id)

export const selectAdUnits = state => selectItemsByType(state, 'AdUnit')

export const selectAdUnitsArray = state =>
	selectItemsArrayByType(state, 'AdUnit')

export const selectAdUnitById = (state, id) =>
	selectItemByTypeAndId(state, 'AdUnit', id)

export const selectAdSlots = state => selectItemsByType(state, 'AdSlot')

export const selectAdSlotsArray = state =>
	selectItemsArrayByType(state, 'AdSlot')

export const selectAdSlotById = (state, id) =>
	selectItemByTypeAndId(state, 'AdSlot', id)

export const selectWebsites = state => selectItemsByType(state, 'Website')

export const selectWebsitesArray = state =>
	selectItemsArrayByType(state, 'Website')

export const selectWebsiteById = (state, id) =>
	selectItemByTypeAndId(state, 'Website', id)

export const selectWebsiteByWebsite = createCachedSelector(
	selectWebsites,
	(_, ws) => ws,
	(items, ws) => (ws ? items[url.parse(ws).hostname] || {} : {})
)((_state, ws = 'all') => ws)

export const selectAudiences = state => selectItemsByType(state, 'Audience')

export const selectAudiencesArray = state =>
	selectItemsArrayByType(state, 'Audience')

export const selectAudienceById = (state, id) =>
	selectItemByTypeAndId(state, 'Audience', id)

export const selectAudienceByCampaignId = createCachedSelector(
	selectCampaignById,
	selectAudiencesArray,
	(_, id) => id,
	(campaign, items, id) => {
		const hasCampaignAudienceUpdated =
			campaign &&
			campaign.audienceInput &&
			campaign.audienceInput.inputs &&
			(campaign.audienceInput.inputs.location ||
				campaign.audienceInput.inputs.categories ||
				campaign.audienceInput.inputs.publishers ||
				campaign.audienceInput.inputs.advanced)

		return hasCampaignAudienceUpdated
			? campaign.audienceInput
			: items.find(x => x && x.campaignId === id)
	}
)((_state, campaignId) => campaignId)

export const selectSavedAudiences = createSelector(
	[selectAudiencesArray],
	items => items.filter(x => x && !x.campaignId && x.title)
)

export const selectWebsitesList = createSelector(
	[selectWebsitesArray],
	websites =>
		websites.sort(
			(a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
		)
)

export const selectCampaignDisplayStatus = (status = {}) => {
	if (status.name === 'Waiting') {
		return 'SCHEDULED'
	} else {
		return (status.humanFriendlyName || '').toUpperCase()
	}
}

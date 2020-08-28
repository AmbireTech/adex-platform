import { createSelector } from 'reselect'
import {
	selectCampaignEventsCount,
	selectCampaignIdInDetails,
	t,
} from 'selectors'
import url from 'url'
export const selectItems = state => state.persist.items

export const selectItemsByType = createSelector(
	[selectItems, (_, itemType) => itemType],
	(items, itemType) => items[itemType] || {}
)

export const selectItemByTypeAndId = createSelector(
	[selectItems, (_, itemType, id) => ({ itemType, id })],
	(items, { itemType, id }) => (items[itemType] || {})[id] || {}
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

export const selectCampaignInDetails = createSelector(
	[selectCampaignIdInDetails, state => state],
	(campaignId, state) => selectCampaignById(state, campaignId)
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

export const selectAdSlotById = createSelector(
	[selectAdSlots, (_, id) => id],
	(items, id) => items[id]
)

export const selectWebsites = createSelector(
	state => selectItemsByType(state, 'Website'),
	websites => websites
)

export const selectWebsitesArray = createSelector(
	state => selectItemsArrayByType(state, 'Website'),
	websites => websites
)

export const selectWebsiteById = createSelector(
	[selectWebsites, (_, id) => id],
	(items, id) => items[id]
)

export const selectWebsiteByWebsite = createSelector(
	[selectWebsites, (_, ws) => ws],
	(items, ws) => (ws ? items[url.parse(ws).hostname] || {} : {})
)

export const selectAudiences = createSelector(
	state => selectItemsByType(state, 'Audience'),
	audiences => audiences
)

export const selectAudiencesArray = createSelector(
	state => selectItemsArrayByType(state, 'Audience'),
	audiences => audiences
)

export const selectAudienceById = createSelector(
	[selectAudiences, (_, id) => id],
	(items, id) => items[id]
)

export const selectAudienceByCampaignId = createSelector(
	[selectCampaignById, selectAudiencesArray, (_, id) => id],
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
)

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
